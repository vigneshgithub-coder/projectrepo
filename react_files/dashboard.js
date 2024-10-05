const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express(); // You missed this line
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
app.use(express.static(path.join(__dirname, 'public_seller')));

// Example route for serving dashboard HTML page
app.get('/sellerdashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_seller', 'sellerdashboard.html'));
});
// Route to handle the root URL `/`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_seller', 'sellerdashboard.html'));  // or redirect to dashboard
    // res.redirect('/dashboard');
  });

// POST route to add a new product
app.post('/add-product', (req, res) => {
    const { seller_id, product_name, price, description, image_url } = req.body;

    if (!seller_id || !product_name || !price || !description || !image_url) {
        return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const query = `INSERT INTO products (seller_id, product_name, price, description, image_url) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [seller_id, product_name, price, description, image_url], (err) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(201).json({ message: 'Product added successfully.' });
    });
});
// PUT route to edit an existing product
app.put('/edit-product/:id', (req, res) => {
    const { product_name, price, description, image_url } = req.body;
    const { id } = req.params;

    const query = `UPDATE products SET product_name = ?, price = ?, description = ?, image_url = ? WHERE id = ?`;
    db.query(query, [product_name, price, description, image_url, id], (err) => {
        if (err) {
            console.log('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ message: 'Product updated successfully.' });
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
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
  
