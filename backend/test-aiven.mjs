import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const connectionConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smart_campus_marketplace",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
};

async function testConn() {
  try {
    console.log("Connecting to Aiven MySQL...");
    const conn = await mysql.createConnection(connectionConfig);
    console.log("Connected successfully!");
    const [rows] = await conn.query("SELECT VERSION() as version, DATABASE() as db");
    console.log("Database info:", rows);
    await conn.end();
  } catch (err) {
    console.error("Connection error:", err.message);
  }
}

testConn();
