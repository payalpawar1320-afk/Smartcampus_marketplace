import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import studentsRouter from "./routes/students.js";
import categoriesRouter from "./routes/categories.js";
import productsRouter from "./routes/products.js";
import wishlistRouter from "./routes/wishlist.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/students", studentsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/wishlist", wishlistRouter);

import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

const __serverDir = path.dirname(fileURLToPath(import.meta.url));
const __distDir = path.resolve(__serverDir, "../dist");

// Serve Frontend static assets
app.use(express.static(__distDir));

// Visual Database Console
app.get("/db", (req, res) => {
  res.sendFile(path.join(__serverDir, "public", "db-dashboard.html"));
});

// Endpoint to view any table formatted
app.get("/api/db-view/:table", async (req, res) => {
  const allowed = ["students", "categories", "products", "wishlist"];
  const table = req.params.table.toLowerCase();
  if (!allowed.includes(table)) {
    return res.status(400).json({ success: false, error: "Invalid table name" });
  }
  try {
    const [rows, fields] = await pool.query(`SELECT * FROM ${table}`);
    res.json({ success: true, rows, fields: fields?.map(f => f.name) || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live SQL execution endpoint
app.post("/api/query", async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ success: false, error: "SQL string is required" });
  try {
    const [result, fields] = await pool.query(sql);
    const rows = Array.isArray(result) ? result : [result];
    res.json({ success: true, rows, fields: fields?.map(f => f.name) || [] });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// SPA fallback: Serve React App for all other routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/db")) return next();
  res.sendFile(path.join(__distDir, "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Internal server error: " + err.message });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Campus Backend running on port ${PORT}`);
  console.log(`📊 Database: MySQL (smart_campus_marketplace)`);
  console.log(`=======================================================`);
});
