const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        const token = jwt.sign({ userId: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Obtener posts (tweets)
app.get('/posts', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT p.*, u.username 
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

// Crear un nuevo post
app.post('/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [req.user.userId, content]
    );
    res.status(201).json({ message: 'Post created successfully', postId: result.insertId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Seguir a un usuario
app.post('/follow', authenticateToken, async (req, res) => {
  const { followedId } = req.body;
  try {
    await db.promise().query(
      'INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)',
      [req.user.userId, followedId]
    );
    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Error following user' });
  }
});

// Obtener seguidores
app.get('/followers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT u.id, u.username 
      FROM followers f 
      JOIN users u ON f.follower_id = u.id 
      WHERE f.followed_id = ?
    `, [req.user.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Error fetching followers' });
  }
});

// Enviar un mensaje
app.post('/messages', authenticateToken, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [req.user.userId, receiverId, content]
    );
    res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Obtener mensajes
app.get('/messages', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT m.*, u.username as sender_username 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.receiver_id = ? 
      ORDER BY m.created_at DESC
    `, [req.user.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));