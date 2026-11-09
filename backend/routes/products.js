import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// ==========================================
// 1. GET ALL PRODUCTS (Read with JOIN)
// Demonstrates INNER JOIN between products, categories, and students
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { category, search, student_id } = req.query;

    let sql = `
      SELECT 
        p.product_id,
        p.student_id,
        p.category_id,
        p.product_name,
        p.description,
        p.price,
        p.condition,
        p.image_url,
        p.created_at,
        c.category_name,
        s.name AS seller_name,
        s.email AS seller_email,
        s.department AS seller_dept
      FROM products p
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN students s   ON p.student_id   = s.student_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== "All") {
      sql += " AND c.category_name = ?";
      params.push(category);
    }

    if (student_id) {
      sql += " AND p.student_id = ?";
      params.push(student_id);
    }

    if (search && search.trim()) {
      sql += " AND (p.product_name LIKE ? OR p.description LIKE ? OR s.name LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY p.product_id DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "MySQL server is not running on localhost:3306. Please start MySQL service or open MySQL Workbench."
      });
    }
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET SINGLE PRODUCT BY ID (Read)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.product_id,
        p.student_id,
        p.category_id,
        p.product_name,
        p.description,
        p.price,
        p.condition,
        p.image_url,
        p.created_at,
        c.category_name,
        s.name AS seller_name,
        s.email AS seller_email,
        s.department AS seller_dept
      FROM products p
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN students s   ON p.student_id   = s.student_id
      WHERE p.product_id = ?
    `;

    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. ADD A PRODUCT (Create)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { student_id, category_id, product_name, description, price, condition, image_url } = req.body;

    // Basic Input Validation
    if (!student_id || !category_id || !product_name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "student_id, category_id, product_name, and price are required"
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Price cannot be negative" });
    }

    // Verify student exists
    const [studentRows] = await pool.query("SELECT student_id FROM students WHERE student_id = ?", [student_id]);
    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid student_id: student does not exist" });
    }

    // Verify category exists
    const [catRows] = await pool.query("SELECT category_id FROM categories WHERE category_id = ?", [category_id]);
    if (catRows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid category_id: category does not exist" });
    }

    const [result] = await pool.query(
      `INSERT INTO products (student_id, category_id, product_name, description, price, \`condition\`, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(student_id),
        Number(category_id),
        product_name.trim(),
        description ? description.trim() : "",
        Number(price),
        condition || "Good",
        image_url || null
      ]
    );

    // Fetch newly created record with joins
    const [newProduct] = await pool.query(
      `SELECT 
        p.*, c.category_name, s.name AS seller_name
       FROM products p
       INNER JOIN categories c ON p.category_id = c.category_id
       INNER JOIN students s   ON p.student_id   = s.student_id
       WHERE p.product_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Product added to database successfully",
      data: newProduct[0]
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. UPDATE PRODUCT DETAILS (Update)
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, category_id, description, price, condition } = req.body;

    if (!product_name || !price) {
      return res.status(400).json({ success: false, message: "product_name and price are required" });
    }

    const [result] = await pool.query(
      `UPDATE products 
       SET product_name = ?, category_id = COALESCE(?, category_id), description = ?, price = ?, \`condition\` = ?
       WHERE product_id = ?`,
      [product_name.trim(), category_id || null, description || "", Number(price), condition || "Good", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE PRODUCT (Delete)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted from database successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
