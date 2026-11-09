import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// ==========================================
// 1. GET ALL STUDENTS (Read)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT student_id, name, email, department, year FROM students ORDER BY student_id ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({ success: false, message: "MySQL not running" });
    }
    console.error("Error fetching students:", error.message);
    res.status(500).json({ success: false, message: "Database query failed: " + error.message });
  }
});

// ==========================================
// 2. GET SINGLE STUDENT BY ID (Read)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT student_id, name, email, department, year FROM students WHERE student_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. REGISTER / ADD STUDENT (Create)
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;

    // Basic Input Validation
    if (!name || !email || !password || !department || !year) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, department, year"
      });
    }

    // Check if email already registered
    const [existing] = await pool.query("SELECT student_id FROM students WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Student with this email already exists" });
    }

    // Insert student using parameterized query
    const [result] = await pool.query(
      "INSERT INTO students (name, email, password, department, year) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), password, department.trim(), Number(year)]
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student_id: result.insertId,
      student: { student_id: result.insertId, name, email, department, year }
    });
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. SIMPLE STUDENT LOGIN (Authentication check)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT student_id, name, email, department, year FROM students WHERE email = ? AND password = ?",
      [email.trim().toLowerCase(), password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      student: rows[0]
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. UPDATE STUDENT DETAILS (Update)
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, year } = req.body;

    if (!name || !department || !year) {
      return res.status(400).json({ success: false, message: "Fields name, department, year are required" });
    }

    const [result] = await pool.query(
      "UPDATE students SET name = ?, department = ?, year = ? WHERE student_id = ?",
      [name.trim(), department.trim(), Number(year), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. DELETE STUDENT (Delete)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM students WHERE student_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
