import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// ==========================================
// 1. GET ALL CATEGORIES (Read)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT category_id, category_name FROM categories ORDER BY category_id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({ success: false, message: "MySQL not running" });
    }
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET SINGLE CATEGORY BY ID (Read)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT category_id, category_name FROM categories WHERE category_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. ADD CATEGORY (Create)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: "category_name is required" });
    }

    const [existing] = await pool.query(
      "SELECT category_id FROM categories WHERE category_name = ?",
      [category_name.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (category_name) VALUES (?)",
      [category_name.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category_id: result.insertId,
      category: { category_id: result.insertId, category_name: category_name.trim() }
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. UPDATE CATEGORY (Update)
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: "category_name is required" });
    }

    const [result] = await pool.query(
      "UPDATE categories SET category_name = ? WHERE category_id = ?",
      [category_name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE CATEGORY (Delete)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM categories WHERE category_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
