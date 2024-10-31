// import { createDbWorker } from 'sql.js-httpvfs';

// const workerUrl = new URL('sql.js-httpvfs/dist/sqlite.worker.js', import.meta.url);
// const wasmUrl = new URL('sql.js-httpvfs/dist/sql-wasm.wasm', import.meta.url);

// export async function initDatabase() {
//   const worker = await createDbWorker(
//     [
//       {
//         from: "inline",
//         config: {
//           serverMode: "full",
//           url: "/database.sqlite3",
//           requestChunkSize: 4096,
//         },
//       },
//     ],
//     workerUrl.toString(),
//     wasmUrl.toString()
//   );

//   await worker.db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username VARCHAR(50) UNIQUE NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       email VARCHAR(100) UNIQUE NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS posts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER NOT NULL,
//       content TEXT NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id)
//     );

//     CREATE TABLE IF NOT EXISTS followers (
//       follower_id INTEGER NOT NULL,
//       followed_id INTEGER NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (follower_id, followed_id),
//       FOREIGN KEY (follower_id) REFERENCES users(id),
//       FOREIGN KEY (followed_id) REFERENCES users(id)
//     );

//     CREATE TABLE IF NOT EXISTS likes (
//       user_id INTEGER NOT NULL,
//       post_id INTEGER NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (user_id, post_id),
//       FOREIGN KEY (user_id) REFERENCES users(id),
//       FOREIGN KEY (post_id) REFERENCES posts(id)
//     );

//     CREATE TABLE IF NOT EXISTS messages (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       sender_id INTEGER NOT NULL,
//       receiver_id INTEGER NOT NULL,
//       content TEXT NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (sender_id) REFERENCES users(id),
//       FOREIGN KEY (receiver_id) REFERENCES users(id)
//     );
//   `);

//   return worker.db;
// }

// let db: any = null;

// export async function getDatabase() {
//   if (!db) {
//     db = await initDatabase();
//   }
//   return db;
// }

// export async function registerUser(username: string, password: string, email: string) {
//   const db = await getDatabase();
//   try {
//     await db.exec({
//       sql: 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
//       bind: [username, password, email]
//     });
//     return true;
//   } catch (error) {
//     console.error('Error registering user:', error);
//     return false;
//   }
// }

// export async function loginUser(username: string, password: string) {
//   const db = await getDatabase();
//   const result = await db.exec({
//     sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
//     bind: [username, password]
//   });
//   return result[0]?.values?.length > 0;
// }

// export async function createPost(userId: number, content: string) {
//   const db = await getDatabase();
//   try {
//     await db.exec({
//       sql: 'INSERT INTO posts (user_id, content) VALUES (?, ?)',
//       bind: [userId, content]
//     });
//     return true;
//   } catch (error) {
//     console.error('Error creating post:', error);
//     return false;
//   }
// }

// export async function fetchPosts() {
//   const db = await getDatabase();
//   const result = await db.exec({
//     sql: `
//       SELECT posts.id, users.username AS author, posts.content, posts.created_at 
//       FROM posts 
//       JOIN users ON posts.user_id = users.id 
//       ORDER BY posts.created_at DESC;
//     `
//   });

//   // Transformar el resultado en un formato más usable
//   if (result.length > 0 && result[0].values) {
//     return result[0].values.map(([id, author, content, created_at]) => ({
//       id,
//       author,
//       content,
//       timestamp: created_at,
//     }));
//   }
//   return [];
// }


// // Aquí puedes agregar más funciones para interactuar con la base de datos
// // como createPost, followUser, likePost, sendMessage, etc.