-- ===================================================
-- SMART CAMPUS MARKETPLACE - DATABASE SCHEMA
-- DBMS Mini Project
-- ===================================================

-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS smart_campus_marketplace;
USE smart_campus_marketplace;

-- Step 2: Drop existing tables in reverse dependency order (if re-running)
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS students;

-- ===================================================
-- Table 1: students
-- Stores registered college students
-- ===================================================
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4)
);

-- ===================================================
-- Table 2: categories
-- Stores item categories (Books, Electronics, Notes, etc.)
-- ===================================================
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE
);

-- ===================================================
-- Table 3: products
-- Stores products listed for sale by students
-- Foreign Keys: student_id -> students, category_id -> categories
-- ===================================================
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    `condition` VARCHAR(50) NOT NULL DEFAULT 'Good',
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_student 
        FOREIGN KEY (student_id) REFERENCES students(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(category_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===================================================
-- Table 4: wishlist
-- Stores saved/bookmarked products for students
-- Composite Unique constraint to prevent duplicate saves
-- ===================================================
CREATE TABLE wishlist (
    wishlist_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    product_id INT NOT NULL,
    CONSTRAINT uq_student_product UNIQUE (student_id, product_id),
    CONSTRAINT fk_wishlist_student 
        FOREIGN KEY (student_id) REFERENCES students(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wishlist_product 
        FOREIGN KEY (product_id) REFERENCES products(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
