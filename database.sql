-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS food_system;
USE food_system;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user'
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    image_url TEXT
);

-- 4. Create Orders Table (With the user_id fix)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Order Received',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert Default Admin Account
INSERT IGNORE INTO users (name, email, password, role) 
VALUES ('System Admin', 'admin@food.com', 'admin123', 'admin');

-- 6. Insert Initial Menu Items
INSERT INTO products (name, price, image_url) VALUES 
('Gourmet Burger', 12.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'),
('Pepperoni Pizza', 15.50, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500'),
('Mexican Tacos', 9.00, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500'),
('Creamy Pasta', 14.20, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500');