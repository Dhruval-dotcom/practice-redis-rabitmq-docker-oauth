const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "taskmanager",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log("Database connected successfully");
      conn.release();
      return;
    } catch (err) {
      console.log(
        `DB connection attempt ${i + 1}/${retries} failed: ${err.message}`
      );
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("Could not connect to database after multiple retries");
}

module.exports = { pool, waitForDB };
