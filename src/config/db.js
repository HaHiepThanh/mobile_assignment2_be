const mysql2 = require('mysql2/promise');
require('dotenv').config();

/**
 * Creates and exports a MySQL connection pool.
 * Using a pool (not a single connection) for concurrency resilience.
 */
const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'thanhhhtt',
  database: process.env.DB_NAME || 'assignment2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
