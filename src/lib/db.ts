import mysql from 'mysql2/promise';

export async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE // Make sure this matches your .env file
  });
}