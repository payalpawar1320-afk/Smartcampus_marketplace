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
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true
};

async function migrate() {
  const conn = await mysql.createConnection(connectionConfig);
  console.log("Connected to Aiven MySQL. Creating tables...");

  const schemaSql = `
    DROP TABLE IF EXISTS wishlist;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS students;

    CREATE TABLE students (
        student_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        year INT NOT NULL CHECK (year BETWEEN 1 AND 4)
    );

    CREATE TABLE categories (
        category_id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE products (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        category_id INT NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        \`condition\` VARCHAR(50) NOT NULL DEFAULT 'Good',
        image_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_products_student 
            FOREIGN KEY (student_id) REFERENCES students(student_id) 
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_products_category 
            FOREIGN KEY (category_id) REFERENCES categories(category_id) 
            ON DELETE CASCADE ON UPDATE CASCADE
    );

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
  `;

  await conn.query(schemaSql);
  console.log("✅ Tables created successfully!");

  const seedSql = `
    INSERT INTO students (student_id, name, email, password, department, year) VALUES
    (1, 'Shruti Sharma', 'shruti@campus.edu', 'pass123', 'Computer Engineering', 3),
    (2, 'Rutuja Patil', 'rutuja@campus.edu', 'pass123', 'Information Technology', 2),
    (3, 'Sneha Kulkarni', 'sneha@campus.edu', 'pass123', 'Electronics & Telecomm', 3),
    (4, 'Anjali Deshmukh', 'anjali@campus.edu', 'pass123', 'Civil Engineering', 1),
    (5, 'Payal Jadhav', 'payal@campus.edu', 'pass123', 'Mechanical Engineering', 4),
    (6, 'Ambika Nair', 'ambika@campus.edu', 'pass123', 'Computer Engineering', 2);

    INSERT INTO categories (category_id, category_name) VALUES
    (1, 'Books'),
    (2, 'Electronics'),
    (3, 'Notes'),
    (4, 'Hostel Essentials'),
    (5, 'Accessories');

    INSERT INTO products (product_id, student_id, category_id, product_name, description, price, \`condition\`, image_url, created_at) VALUES
    (1, 2, 1, 'Engineering Mathematics Book', 'Standard 2nd year Engineering Mathematics textbook by H.K. Dass. Clean pages with slight highlights.', 250.00, 'Good', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 5 DAY),
    (2, 3, 2, 'Scientific Calculator FX-991EX', 'Casio ClassWiz fx-991EX non-programmable calculator. Works perfectly with battery backup included.', 650.00, 'Like New', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 3 DAY),
    (3, 4, 5, 'College Backpack (Waterproof)', 'Spacious 30L bag with laptop compartment, USB charging port, and rain cover.', 450.00, 'Good', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 2 DAY),
    (4, 1, 3, 'DBMS Handwritten Exam Notes', 'Comprehensive unit 1-5 Database Management System notes with previous year university questions solved.', 100.00, 'New', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 2 DAY),
    (5, 6, 4, 'LED Study Desk Lamp', 'Rechargeable touch LED lamp with 3 brightness modes and flexible neck.', 300.00, 'Like New', 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 1 DAY),
    (6, 5, 2, 'Logitech Wireless Mouse', 'Ergonomic 2.4GHz wireless optical mouse with micro nano receiver.', 399.00, 'Good', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL 12 HOUR);

    INSERT INTO wishlist (student_id, product_id) VALUES
    (1, 2),
    (1, 6),
    (2, 1),
    (3, 4);
  `;

  await conn.query(seedSql);
  console.log("✅ Seed data inserted successfully!");

  const [[{ studentCount }]] = await conn.query("SELECT COUNT(*) as studentCount FROM students");
  const [[{ productCount }]] = await conn.query("SELECT COUNT(*) as productCount FROM products");
  const [[{ categoryCount }]] = await conn.query("SELECT COUNT(*) as categoryCount FROM categories");

  console.log(`📊 Current Cloud Database Status:`);
  console.log(`- Students: ${studentCount}`);
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Products: ${productCount}`);

  await conn.end();
}

migrate().catch(console.error);
