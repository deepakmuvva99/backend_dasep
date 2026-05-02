const mysql = require('mysql2/promise');
const requireDotEnv = require('dotenv');

requireDotEnv.config();

// Create a connection pool to handle multiple database connections efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }, // Required for Azure MySQL Flexible Server
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection logic to ensure it can reach the database
pool.getConnection()
    .then((connection) => {
        console.log('✅ Successfully connected to the MySQL database!');
        connection.release();
    })
    .catch((error) => {
        console.error('❌ Error connecting to the MySQL database:', error.message);
    });

module.exports = pool;
