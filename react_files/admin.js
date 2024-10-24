const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vignesh@22',
    database: 'ecommerce_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'admin')));

// Example route for serving admin dashboard HTML page
app.get('admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin','admin.html'));
});

app.get('/', (req, res) => {
    res.redirect('/admin.html'); // Redirect to admin dashboard
});

// --- Products Management ---

// GET route to fetch all products
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, products) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.json(products);
    });
});

// POST route to add a new product
app.post('/add-product', (req, res) => {
    const { seller_id, product_name, price, description, image_url, stackQuantity } = req.body;
    const query = `INSERT INTO products (seller_id, product_name, price, description, image_url,stackQuantity) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [seller_id, product_name, price, description, image_url,stackQuantity], (err) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(201).json({ message: 'Product added successfully.' });
    });
});

// DELETE route to delete a product
app.delete('/delete-product/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM products WHERE id = ?`;
    db.query(query, [id], (err) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ message: 'Product deleted successfully.' });
    });
});

// --- Users Management ---

// GET route to fetch all users (sellers)
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM client'; // Assuming sellers table holds user info
    db.query(query, (err, users) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.json(users);
    });
});

// DELETE route to delete a user
app.delete('/delete-user/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM seller WHERE id = ?`;
    db.query(query, [id], (err) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    });
});

// --- Orders Management ---

// GET route to fetch all orders
app.get('/orders', (req, res) => {
    const query = 'SELECT * FROM orders'; // Assuming orders table exists
    db.query(query, (err, orders) => {
        if (err) { 
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.json(orders);
    });
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


