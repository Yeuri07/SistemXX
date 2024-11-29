// Add this to your existing imports at the top
const path = require('path');
const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});



// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profileUploadsDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// Configure multer for file uploads with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if it's a profile picture upload
    const dest = file.fieldname === 'profile_picture' ? profileUploadsDir : uploadsDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
}).single('media');

const profileUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
  }
}).single('profile_picture');



// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the database.');
  
//   // Create tables if they don't exist
//   const createTables = `
//     CREATE TABLE IF NOT EXISTS users (
//       id INT PRIMARY KEY AUTO_INCREMENT,
//       username VARCHAR(50) UNIQUE NOT NULL,
//       email VARCHAR(100) UNIQUE NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       profile_picture VARCHAR(255),
//       status TEXT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS posts (
//       id INT PRIMARY KEY AUTO_INCREMENT,
//       user_id INT NOT NULL,
//       content TEXT NOT NULL,
//       media_url VARCHAR(255),
//       media_type ENUM('image', 'video'),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id)
//     );

//     CREATE TABLE IF NOT EXISTS likes (
//       user_id INT,
//       post_id INT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (user_id, post_id),
//       FOREIGN KEY (user_id) REFERENCES users(id),
//       FOREIGN KEY (post_id) REFERENCES posts(id)
//     );

//     CREATE TABLE IF NOT EXISTS comments (
//       id INT PRIMARY KEY AUTO_INCREMENT,
//       post_id INT,
//       user_id INT,
//       content TEXT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (post_id) REFERENCES posts(id),
//       FOREIGN KEY (user_id) REFERENCES users(id)
//     );
//   `;

//   db.query(createTables, (err) => {
//     if (err) {
//       console.error('Error creating tables:', err);
//       return;
//     }
//     console.log('Database tables created/verified successfully');
//   });
// });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Update profile picture
app.post('/users/profile-picture', authenticateToken, (req, res) => {
  profileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Delete old profile picture if it exists
      const [user] = await db.promise().query(
        'SELECT profile_picture FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (user[0]?.profile_picture) {
        const oldPicturePath = path.join(__dirname, user[0].profile_picture);
        fs.unlink(oldPicturePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting old profile picture:', err);
          }
        });
      }

      const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
      await db.promise().query(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePicturePath, req.user.userId]
      );

      res.json({ 
        message: 'Profile picture updated successfully',
        profile_picture: profilePicturePath
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Error updating profile picture' });
    }
  });
});

// Update user status
app.post('/users/status', authenticateToken, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    await db.promise().query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.user.userId]
    );

    res.json({ 
      message: 'Status updated successfully',
      status
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Get user profile
app.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.promise().query(
      'SELECT id, username, email, profile_picture, status, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Existing routes...
// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if username or email already exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        profile_picture: user.profile_picture,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Create a post
app.post('/posts', authenticateToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      // If there's an upload error, remove any uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error removing failed upload:', unlinkErr);
        });
      }
      return res.status(400).json({ message: err.message });
    }

    const { content } = req.body;
    if (!content && !req.file) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error removing failed upload:', unlinkErr);
        });
      }
      return res.status(400).json({ message: 'Post must contain either content or media' });
    }

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }

      const [result] = await db.promise().query(
        'INSERT INTO posts (user_id, content, media_url, media_type) VALUES (?, ?, ?, ?)',
        [req.user.userId, content, mediaUrl, mediaType]
      );

      const [post] = await db.promise().query(
        'SELECT p.*, u.username, u.profile_picture FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
        [result.insertId]
      );

      res.status(201).json(post[0]);
    } catch (error) {
      // If database insertion fails, remove the uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error removing failed upload:', unlinkErr);
        });
      }
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Error creating post' });
    }
  });
});

// Get posts
app.get('/posts', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT p.*, u.username, u.profile_picture 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT 50
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Like a post
app.post('/posts/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  try {
    await db.promise().query(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [req.user.userId, postId]
    );
    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Unlike a post
app.delete('/posts/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  try {
    await db.promise().query(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.userId, postId]
    );
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Error unliking post' });
  }
});

// Get post likes count
app.get('/posts/:id/likes', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId]
    );
    res.json({ likes: rows[0].count });
  } catch (error) {
    console.error('Error getting post likes:', error);
    res.status(500).json({ message: 'Error getting post likes' });
  }
});

// Add comment to a post
app.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.userId, content]
    );

    const [comment] = await db.promise().query(
      `SELECT c.*, u.username, u.profile_picture 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json(comment[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Get comments for a post
app.get('/posts/:id/comments', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT c.*, u.username, u.profile_picture 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at DESC
    `, [postId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

//Get info of users

app.get('/users/profile/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  
  try {
    const [user] = await db.promise().query(
      `SELECT u.id, u.username, u.email,profile_picture,status,
      (SELECT COUNT(*) FROM followers WHERE followed_id = u.id) as followers_count,
      (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
      FROM users u
      WHERE u.username = ?`,
      [username]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Get user posts by username
app.get('/users/:username/posts', authenticateToken, async (req, res) => {
  const { username } = req.params;
  
  try {
    const [posts] = await db.promise().query(
      `SELECT p.*, u.username 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE u.username = ? 
       ORDER BY p.created_at DESC`,
      [username]
    );

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

//--------------
// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.id;
    socket.join(decoded.id.toString());
    next();
  });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('markNotificationAsRead', async (notificationId) => {
    try {
      await db.promise().query(
        'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
        [notificationId, socket.userId]
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Create notification function
async function createNotification(userId, type, actorId, targetId) {
  try {
    const [result] = await db.promise().query(
      'INSERT INTO notifications (user_id, type, actor_id, target_id, is_read) VALUES (?, ?, ?, ?, false)',
      [userId, type, actorId, targetId]
    );

    const [notifications] = await db.promise().query(
      `SELECT n.*, u.username as actor_username 
       FROM notifications n 
       JOIN users u ON n.actor_id = u.id 
       WHERE n.id = ?`,
      [result.insertId]
    );

    if (notifications[0]) {
      io.to(userId.toString()).emit('notification', notifications[0]);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Follow user endpoint
app.post('/users/:userId/follow', authenticateToken, async (req, res) => {
  const followerId = req.user.id;
  const followedId = parseInt(req.params.userId);

  try {
    await db.promise().query(
      'INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)',
      [followerId, followedId]
    );

    await createNotification(followedId, 'follow', followerId, null);

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Error following user' });
  }
});

// Like post endpoint
app.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Add like
    await db.promise().query(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    // Get post owner
    const [posts] = await db.promise().query(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length > 0) {
      // Create notification for post owner
      await createNotification(posts[0].user_id, 'like', userId, postId);
    }

    // Get updated likes count
    const [result] = await db.promise().query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId]
    );

    // Emit like event to all connected clients
    io.emit('postLiked', { postId, likesCount: result[0].count });

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Retweet post endpoint
app.post('/posts/:postId/retweet', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.postId);

  try {
    await db.promise().query(
      'INSERT INTO retweets (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    const [post] = await db.promise().query(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (post[0] && post[0].user_id !== userId) {
      await createNotification(post[0].user_id, 'retweet', userId, postId);
    }

    res.json({ message: 'Successfully retweeted post' });
  } catch (error) {
    console.error('Error retweeting post:', error);
    res.status(500).json({ message: 'Error retweeting post' });
  }
});

// Get notifications endpoint
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await db.promise().query(
      `SELECT n.*, u.username as actor_username 
       FROM notifications n 
       JOIN users u ON n.actor_id = u.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC`,
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Search users endpoint
app.get('/users/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  const userId = req.user.userId;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: 'Search query cannot be empty' });
  }

  console.log('Buscando usuarios con q:', q);
  console.log('ID del usuario autenticado:', userId);

  try {
    const [users] = await db.promise().query(
      `SELECT u.id, u.username,
              EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = u.id) as isFollowing
       FROM users u
       WHERE u.username LIKE ? AND u.id != ?
       LIMIT 10`,
      [userId, `%${q}%`, userId]
    );

    console.log('Usuarios encontrados:', users);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});



//--------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));