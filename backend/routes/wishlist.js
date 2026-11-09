import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// ==========================================
// 1. GET STUDENT WISHLIST (Read with JOIN)
// Demonstrates INNER JOIN between wishlist, products, and categories
// ==========================================
router.get("/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;

    const sql = `
      SELECT 
        w.wishlist_id,
        w.student_id,
        w.product_id,
        p.product_name,
        p.description,
        p.price,
        p.condition,
        p.created_at,
        c.category_name,
        s.name AS seller_name
      FROM wishlist w
      INNER JOIN products p   ON w.product_id   = p.product_id
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN students s   ON p.student_id   = s.student_id
      WHERE w.student_id = ?
      ORDER BY w.wishlist_id DESC
    `;

    const [rows] = await pool.query(sql, [student_id]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. ADD PRODUCT TO WISHLIST (Create)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { student_id, product_id } = req.body;

    if (!student_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and product_id are required"
      });
    }

    // Check if already in wishlist
    const [existing] = await pool.query(
      "SELECT wishlist_id FROM wishlist WHERE student_id = ? AND product_id = ?",
      [student_id, product_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Item is already in your wishlist" });
    }

    const [result] = await pool.query(
      "INSERT INTO wishlist (student_id, product_id) VALUES (?, ?)",
      [student_id, product_id]
    );

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist_id: result.insertId
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. REMOVE PRODUCT FROM WISHLIST (Delete)
// ==========================================
router.delete("/:student_id/:product_id", async (req, res) => {
  try {
    const { student_id, product_id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM wishlist WHERE student_id = ? AND product_id = ?",
      [student_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }

    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error deleting from wishlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
