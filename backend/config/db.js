import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Create a connection pool for MySQL
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "smart_campus_marketplace",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SSL === "true") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

// Test MySQL connection once at startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ [MySQL] Successfully connected to database: " + (process.env.DB_NAME || "smart_campus_marketplace"));
    connection.release();
  } catch (error) {
    console.error("⚠️ [MySQL Connection Notice]:", error.message);
    console.log("💡 Tip: Make sure your MySQL Server / MySQL Workbench is running and check backend/.env credentials.");
  }
})();

export default pool;
