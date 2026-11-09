-- ===================================================
-- SMART CAMPUS MARKETPLACE - SEED DATA
-- Fictional sample records matching existing campus products
-- ===================================================

USE smart_campus_marketplace;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE wishlist;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE students;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------
-- 1. Insert Campus Students
-- ---------------------------------------------------
INSERT INTO students (student_id, name, email, password, department, year) VALUES
(1, 'Shruti Sharma', 'shruti@campus.edu', 'pass123', 'Computer Engineering', 3),
(2, 'Rutuja Patil', 'rutuja@campus.edu', 'pass123', 'Information Technology', 2),
(3, 'Sneha Kulkarni', 'sneha@campus.edu', 'pass123', 'Electronics & Telecomm', 3),
(4, 'Anjali Deshmukh', 'anjali@campus.edu', 'pass123', 'Civil Engineering', 1),
(5, 'Payal Jadhav', 'payal@campus.edu', 'pass123', 'Mechanical Engineering', 4),
(6, 'Ambika Nair', 'ambika@campus.edu', 'pass123', 'Computer Engineering', 2);

-- ---------------------------------------------------
-- 2. Insert Categories
-- ---------------------------------------------------
INSERT INTO categories (category_id, category_name) VALUES
(1, 'Books'),
(2, 'Electronics'),
(3, 'Notes'),
(4, 'Hostel Essentials'),
(5, 'Accessories');

-- ---------------------------------------------------
-- 3. Insert Campus Products with Real Photos
-- ---------------------------------------------------
INSERT INTO products (product_id, student_id, category_id, product_name, description, price, `condition`, image_url, created_at) VALUES
(1, 2, 1, 'Engineering Mathematics Book', 'Standard 2nd year Engineering Mathematics textbook by H.K. Dass. Clean pages with slight highlights.', 250.00, 'Good', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 5 DAY),
(2, 3, 2, 'Scientific Calculator FX-991EX', 'Casio ClassWiz fx-991EX non-programmable calculator. Works perfectly with battery backup included.', 650.00, 'Like New', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 3 DAY),
(3, 4, 5, 'College Backpack (Waterproof)', 'Spacious 30L bag with laptop compartment, USB charging port, and rain cover.', 450.00, 'Good', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 2 DAY),
(4, 1, 3, 'DBMS Handwritten Exam Notes', 'Comprehensive unit 1-5 Database Management System notes with previous year university questions solved.', 100.00, 'New', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 2 DAY),
(5, 6, 4, 'LED Study Desk Lamp', 'Rechargeable touch LED lamp with 3 brightness modes and flexible neck.', 300.00, 'Like New', 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 1 DAY),
(6, 5, 2, 'Logitech Wireless Mouse', 'Ergonomic 2.4GHz wireless optical mouse with micro nano receiver.', 399.00, 'Good', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 12 HOUR);

-- ---------------------------------------------------
-- 4. Insert Wishlist Records
-- ---------------------------------------------------
INSERT INTO wishlist (student_id, product_id) VALUES
(1, 2), -- Shruti saved Calculator
(1, 6), -- Shruti saved Mouse
(2, 1), -- Rutuja saved Math Book
(3, 4); -- Sneha saved DBMS Notes
