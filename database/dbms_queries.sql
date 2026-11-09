-- =======================================================================
-- SMART CAMPUS MARKETPLACE - SQL QUERIES & SCRIPT COLLECTION
-- Comprehensive relational database queries with explanations
-- =======================================================================

USE smart_campus_marketplace;

-- =======================================================================
-- 1. INSERT QUERY
-- Purpose: Add new records to students, categories, products, or wishlist
-- =======================================================================
-- Insert a new student
INSERT INTO students (name, email, password, department, year)
VALUES ('Vikram Deshmukh', 'vikram@campus.edu', 'secret123', 'Computer Engineering', 2);

-- Insert a new product
INSERT INTO products (student_id, category_id, product_name, description, price, `condition`)
VALUES (1, 2, 'USB-C Fast Charging Adapter 20W', 'Apple compatible fast charger with braided cable', 499.00, 'Like New');


-- =======================================================================
-- 2. SELECT QUERY
-- Purpose: Retrieve data from tables with specific columns
-- =======================================================================
-- Retrieve all columns from students
SELECT * FROM students;

-- Retrieve specific product details
SELECT product_id, product_name, price, `condition` FROM products;


-- =======================================================================
-- 3. UPDATE QUERY
-- Purpose: Modify existing records in a table
-- =======================================================================
-- Update the price and condition of a specific product
UPDATE products
SET price = 220.00, `condition` = 'Used'
WHERE product_id = 1;

-- Update student department
UPDATE students
SET department = 'Artificial Intelligence & Data Science'
WHERE student_id = 2;


-- =======================================================================
-- 4. DELETE QUERY
-- Purpose: Remove records from a table
-- =======================================================================
-- Remove an item from a student's wishlist
DELETE FROM wishlist
WHERE student_id = 1 AND product_id = 2;

-- Delete a specific product (demonstrates ON DELETE CASCADE in child tables)
DELETE FROM products
WHERE product_id = 10;


-- =======================================================================
-- 5. WHERE CLAUSE (Filtering Data)
-- Purpose: Filter records using comparison operators (AND, OR, BETWEEN, LIKE)
-- =======================================================================
-- Find products priced under ₹400 in 'Good' or 'New' condition
SELECT product_id, product_name, price, `condition`
FROM products
WHERE price <= 400.00 AND `condition` IN ('Good', 'New');

-- Find students in 3rd or 4th year from Computer or IT departments
SELECT name, email, department, year
FROM students
WHERE year >= 3 AND (department LIKE '%Computer%' OR department LIKE '%Information%');


-- =======================================================================
-- 6. ORDER BY CLAUSE (Sorting)
-- Purpose: Sort query results in ascending (ASC) or descending (DESC) order
-- =======================================================================
-- Sort products by price from highest to lowest
SELECT product_name, price, `condition`, created_at
FROM products
ORDER BY price DESC;

-- Sort students alphabetically by department, then by year ascending
SELECT department, year, name, email
FROM students
ORDER BY department ASC, year ASC;


-- =======================================================================
-- 7. GROUP BY CLAUSE
-- Purpose: Group rows sharing a property to perform aggregate calculations
-- =======================================================================
-- Count total products listed per category
SELECT c.category_name, COUNT(p.product_id) AS total_products
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name;

-- Count students per department
SELECT department, COUNT(student_id) AS student_count
FROM students
GROUP BY department
HAVING COUNT(student_id) >= 1;


-- =======================================================================
-- 8. AGGREGATE FUNCTIONS (COUNT, AVG, MAX, MIN, SUM)
-- Purpose: Calculate statistical summaries on numeric product columns
-- =======================================================================
SELECT 
    COUNT(product_id)         AS total_items,
    ROUND(AVG(price), 2)      AS average_price,
    MAX(price)                AS most_expensive,
    MIN(price)                AS cheapest_item,
    SUM(price)                AS total_inventory_value
FROM products;


-- =======================================================================
-- 9. INNER JOIN
-- Purpose: Match records from multiple tables with matching keys
-- =======================================================================
-- Display full product details with the seller's name and category name
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.price,
    p.`condition`,
    s.name AS seller_name,
    s.department AS seller_dept,
    s.email AS seller_email
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
INNER JOIN students s   ON p.student_id   = s.student_id
ORDER BY p.price ASC;


-- =======================================================================
-- 10. LEFT JOIN
-- Purpose: Returns all rows from left table, with matching right table rows
-- =======================================================================
-- Display ALL students and any products they have listed (even if 0 products)
SELECT 
    s.student_id,
    s.name AS student_name,
    s.department,
    p.product_id,
    p.product_name,
    p.price
FROM students s
LEFT JOIN products p ON s.student_id = p.student_id
ORDER BY s.student_id;


-- =======================================================================
-- 11. SUBQUERY
-- Purpose: A query nested inside another query (Scalar & In subqueries)
-- =======================================================================
-- Subquery 1: Find all products priced strictly higher than the average price
SELECT product_id, product_name, price
FROM products
WHERE price > (
    SELECT AVG(price) FROM products
);

-- Subquery 2: Find all students who have at least one item in their wishlist
SELECT student_id, name, email, department
FROM students
WHERE student_id IN (
    SELECT DISTINCT student_id FROM wishlist
);


-- =======================================================================
-- 12. PRIMARY KEY AND FOREIGN KEY CONSTRAINTS DEMO
-- Purpose: Demonstrating referential integrity
-- =======================================================================
-- Checking table constraints via information_schema
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_campus_marketplace' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;


-- =======================================================================
-- 13. TRANSACTION WITH COMMIT AND ROLLBACK
-- Purpose: Ensure ACID properties during multiple database modifications
-- =======================================================================

-- Example A: Successful transaction (adds a product and automatically saves to wishlist)
START TRANSACTION;

INSERT INTO products (student_id, category_id, product_name, description, price, `condition`)
VALUES (1, 1, 'Computer Organization Architecture (Stallings)', 'Semester 4 textbook', 320.00, 'Good');

-- Retrieve generated ID using LAST_INSERT_ID()
SET @new_prod_id = LAST_INSERT_ID();

INSERT INTO wishlist (student_id, product_id)
VALUES (1, @new_prod_id);

-- Commit permanently saves both insertions
COMMIT;


-- Example B: Transaction with ROLLBACK (e.g., simulating validation failure)
START TRANSACTION;

-- Intended price was negative or invalid
INSERT INTO products (student_id, category_id, product_name, description, price, `condition`)
VALUES (2, 2, 'Faulty USB Hub', 'Damaged ports', 50.00, 'Used');

-- Discard changes and revert database to state prior to START TRANSACTION
ROLLBACK;
