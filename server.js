const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 🛠 DATABASE CONFIGURATION ---
const dbConfig = {
    host: 'localhost',
    user: 'root',      // Check if this matches your MySQL
    password: '1234',      // IF YOU HAVE A PASSWORD, PUT IT HERE (e.g., 'root123')
    database: 'food_system'
};

// Create a connection pool for stability
const pool = mysql.createPool(dbConfig);

// Test Connection on Startup
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ Successfully connected to MySQL Database!");
        conn.release();
    } catch (err) {
        console.error("❌ DATABASE ERROR: " + err.message);
        console.log("CHECK: Is your MySQL/XAMPP running? Did you create the 'food_system' database?");
    }
})();

// --- 📜 MONITORING LOGS ---
function logAction(msg) {
    const entry = `[${new Date().toLocaleString()}] -> ${msg}\n`;
    fs.appendFileSync(path.join(__dirname, 'db_logs.txt'), entry);
}

// --- 🚀 AUTH ROUTES ---

// Signup
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await pool.execute("INSERT INTO users (name, email, password) VALUES (?,?,?)", [name, email, password]);
        logAction(`USER SIGNUP: Email ${email} created an account.`);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Email already exists or DB Error." });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.execute("SELECT * FROM users WHERE email=? AND password=?", [email, password]);
        if (rows.length > 0) {
            logAction(`USER LOGIN: ${email} logged in.`);
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ error: "Invalid Email or Password." });
        }
    } catch (e) {
        res.status(500).json({ error: "Server error during login." });
    }
});

// --- 🍔 MENU & ORDER ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    const [rows] = await pool.execute("SELECT * FROM products");
    res.json(rows);
});

// Place Order (This fixed the 'user_id' error)
app.post('/api/order', async (req, res) => {
    try {
        let { userId, userName, total, card } = req.body;

        // Strip spaces from pseudo card digits
        const cleanCard = card.toString().replace(/\s/g, '');

        if (cleanCard.length !== 16) {
            return res.status(400).json({ error: "Card must be exactly 16 digits." });
        }

        // DB Query (Assumes user_id column exists now)
        await pool.execute(
            "INSERT INTO orders (user_id, user_name, total_amount) VALUES (?,?,?)", 
            [userId, userName, total]
        );

        logAction(`SUCCESSFUL PAYMENT: $${total} paid by ${userName} (UserID: ${userId})`);
        res.json({ success: true });
    } catch (e) {
        console.error("Order Insert Error: ", e.message);
        res.status(500).json({ error: "Database Order Failure. Is 'user_id' column added to table?" });
    }
});

// Get User Specific Tracking History
app.get('/api/orders/:uid', async (req, res) => {
    const [rows] = await pool.execute("SELECT * FROM orders WHERE user_id=? ORDER BY order_date DESC", [req.params.uid]);
    res.json(rows);
});

// --- 🛡️ ADMIN ROUTES ---

// Admin Stats and All Orders
app.get('/api/admin/all', async (req, res) => {
    try {
        const [orders] = await pool.execute("SELECT * FROM orders ORDER BY order_date DESC");
        const [stats] = await pool.execute("SELECT COUNT(*) as count, SUM(total_amount) as sales FROM orders");
        res.json({ orders, stats: stats[0] });
    } catch (e) { res.status(500).send("Admin Error"); }
});

// Update Order Status (Preparing / Completed)
app.post('/api/admin/update', async (req, res) => {
    const { id, status } = req.body;
    await pool.execute("UPDATE orders SET status=? WHERE id=?", [status, id]);
    logAction(`STATUS UPDATE: Order #${id} moved to status [${status}]`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(` 🚀 SERVER: http://localhost:${PORT}`);
    console.log(` 📜 LOGS: Check db_logs.txt for activity`);
    console.log(`===========================================`);
});