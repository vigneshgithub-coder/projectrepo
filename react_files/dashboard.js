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

// Serve static files from the 'public_seller' folder
app.use(express.static(path.join(__dirname, 'public_seller')));

// Route for serving the seller dashboard HTML page
app.get('/sellerdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_seller', 'sellerdashboard.html'));
});

// Route to handle the root URL `/`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_seller', 'sellerdashboard.html'));
});

// POST route to add a new product
// POST route to add a new product
app.post('/add-product', (req, res) => {
  console.log("----> we are inside add product");
  console.log('Request body:', req.body); // Log the request body
  const { seller_id, product_name, price, description, image_url } = req.body;

  // Validate input
  if (!seller_id || !product_name || !price || !description || !image_url) {
      return res.status(400).json({ message: 'Please fill all fields.' });
  }

  // Check if seller exists before adding a product
  const sellerCheckQuery = 'SELECT * FROM sellers WHERE id = ?';
  db.query(sellerCheckQuery, [seller_id], (err, sellerResult) => {
      if (err) {
          return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
      }
      if (sellerResult.length === 0) {
          return res.status(404).json({ message: 'Seller not found.' });
      }

      const query = 'INSERT INTO products (seller_id, product_name, price, description, image_url) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [seller_id, product_name, price, description, image_url], (err) => {
          if (err) {
              console.error('Database Error: ', err);
              return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
          }
          res.status(201).json({ message: 'Product added successfully.' });
      });
  });
});



// PUT route to edit an existing product
app.put('/edit-product/:id', (req, res) => {
    const { product_name, price, description, image_url } = req.body;
    const { id } = req.params;

    if (!product_name || !price || !description || !image_url) {
        return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const query = 'UPDATE products SET product_name = ?, price = ?, description = ?, image_url = ? WHERE id = ?';
    db.query(query, [product_name, price, description, image_url, id], (err) => {
        if (err) {
            console.error('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ message: 'Product updated successfully.' });
    });
});

// DELETE route to delete a product
app.delete('/delete-product/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Database Error: ', err);
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ message: 'Product deleted successfully.' });
    });
});

// GET route to retrieve products by seller_id
app.get('/products/:id', (req, res) => {
    const seller_id = req.params.id;

    const query = 'SELECT * FROM products WHERE seller_id = ?';
    db.query(query, [seller_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No products found for this seller.' });
        }
        res.status(200).json(results); // Return all products for the seller
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
