const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool using environment variables. Connection pooling
// improves performance by reusing connections instead of creating a new
// one for each query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool };