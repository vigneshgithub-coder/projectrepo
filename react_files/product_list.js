const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const saltRounds = 10;

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

  // Route to handle the root URL `/`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_product_list', 'product_listing.html'));  // or redirect to dashboard
    // res.redirect('/dashboard');
  });

// Route to get all products
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error.' });
      res.json(results);
    });
  });
   // Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
  
  