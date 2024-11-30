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
const { createServer } = require('node:http');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const server = createServer(app);

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



//Create uploads directory if it doesn't exist
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
      'SELECT id, username, email, profile_picture, status FROM users WHERE id = ?',
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
  const [rows] = await db.promise().query('SELECT user_id FROM posts WHERE id = ?', [postId]);
  const postOwnerId = rows.length > 0 ? rows[0].user_id : null;
  
  try {
    await db.promise().query(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [req.user.userId, postId]
    );

    await createNotification(postOwnerId, 'like', req.user.userId, null);
    res.json({ message: 'Post liked successfully' });
      // Get updated likes count
     const [result] = await db.promise().query(
       'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
       [postId]
     );
      // Emit like event to all connected clients
    io.emit('postLiked', { postId, likesCount: result[0].count });
     console.log(result)
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
  const userId = req.user.userId; // Obtén el user_id del token (deberías tenerlo disponible si estás usando algún tipo de autenticación JWT)

  try {
    // Consulta para obtener el conteo de likes del post
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId]
    );

    // Consulta para verificar si el usuario autenticado ha dado like
    const [userLikeRows] = await db.promise().query(
      'SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );

    // Si el usuario ha dado like, userLikeRows tendrá alguna fila, de lo contrario estará vacío
    const isLikedByUser = userLikeRows.length > 0;

    // Enviar la respuesta con el conteo de likes y si el usuario ha dado like
    res.json({
      likes: rows[0].count,       // El número de likes
      isLikedByUser: isLikedByUser // Si el usuario ha dado like
    });
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

    //   // Create a notification for the post owner
    // if (postOwnerId !== req.user.userId) { // Avoid sending a notification to the commenter themselves
    //   await createNotification(postId, 'comment', req.user.userId, postId);
    // }

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

// Verificar si el usuario actual sigue a otro usuario
app.get('/users/:id/is-following', authenticateToken, async (req, res) => {
  const targetUserId = req.params.id; // Usuario objetivo (el ID del perfil consultado)
  const currentUserId = req.user.userId; // Usuario actual (obtenido de authenticateToken)

  try {
    // Consulta si hay una relación en la tabla followers
    const [rows] = await db.promise().query(
      'SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = ?',
      [currentUserId, targetUserId]
    );

    // Si hay una fila, el usuario está siguiendo al objetivo
    const isFollowing = rows.length > 0;

    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Error checking follow status' });
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
    socket.userId = decoded.userId;
    socket.join(decoded.userId.toString());
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
  const followerId = req.user.userId;
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

// Unfollow user endpoint
app.delete('/users/:userId/unfollow', authenticateToken, async (req, res) => {
  const unfollowerId = req.user.userId;  // El ID del usuario que está dejando de seguir
  const followedId = parseInt(req.params.userId);  // El ID del usuario al que se le deja de seguir

  try {
    // Elimina el registro de seguimiento
    await db.promise().query(
      'DELETE FROM followers WHERE follower_id = ? AND followed_id = ?',
      [unfollowerId, followedId]
    );


    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});


// // Like post endpoint
// app.post('/posts/:postId/like', authenticateToken, async (req, res) => {
//   const { postId } = req.params;
//   const userId = req.user.id;
//   try {
   
//     // Add like
//     await db.promise().query(
//       'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
//       [userId, postId]
//     );

//     await createNotification(userId, 'like', userId, null);
       
//     // Get post owner
//     const [posts] = await db.promise().query(
//       'SELECT user_id FROM posts WHERE id = ?',
//       [postId]
//     );

//     
//     if (posts.length > 0) {
//       // Create notification for post owner
//       await createNotification(posts[0].userId, 'like', userId, postId);
//     }

//     // Get updated likes count
//     const [result] = await db.promise().query(
//       'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
//       [postId]
//     );

//     // Emit like event to all connected clients
//     io.emit('postLiked', { postId, likesCount: result[0].count });

//     res.json({ message: 'Post liked successfully' });
//   } catch (error) {
//     console.error('Error unliking post:', error);
//     res.status(500).json({ message: 'Error unliking post' });
//   }
// });



// // Retweet post endpoint
// app.post('/posts/:postId/retweet', authenticateToken, async (req, res) => {
//   const userId = req.user.id;
//   const postId = parseInt(req.params.postId);

//   try {
//     await db.promise().query(
//       'INSERT INTO retweets (user_id, post_id) VALUES (?, ?)',
//       [userId, postId]
//     );

//     const [post] = await db.promise().query(
//       'SELECT user_id FROM posts WHERE id = ?',
//       [postId]
//     );

//     if (post[0] && post[0].user_id !== userId) {
//       await createNotification(post[0].user_id, 'retweet', userId, postId);
//     }

//     res.json({ message: 'Successfully retweeted post' });
//   } catch (error) {
//     console.error('Error retweeting post:', error);
//     res.status(500).json({ message: 'Error retweeting post' });
//   }
// });

// Get notifications endpoint
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await db.promise().query(
      `SELECT n.*, u.username as actor_username 
       FROM notifications n 
       JOIN users u ON n.actor_id = u.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC`,
      [req.user.userId]
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

  try {
    const [users] = await db.promise().query(
      `SELECT u.id, u.username,
              EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = u.id) as isFollowing
       FROM users u
       WHERE u.username LIKE ? AND u.id != ?
       LIMIT 10`,
      [userId, `%${q}%`, userId]
    );

  

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

app.get('/messager', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

//--------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


