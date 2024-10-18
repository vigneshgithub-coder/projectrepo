const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

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
    res.sendFile(path.join(__dirname, 'public_product_list', 'product_listing.html'));
});

//middleware setup
app.use(bodyParser.json());


app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_product_list', 'cart.html'));
});

// Route to get all products with optional search query
app.get('/products', (req, res) => {
    let query = 'SELECT * FROM products';
    const searchQuery = req.query.search; // Get the search term from query parameters

    if (searchQuery) {
        // If a search query is provided, filter products based on product_name
        query += ' WHERE product_name LIKE ?';
    }

    db.query(query, [`%${searchQuery || ''}%`], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        res.json(results); // Send the results back as JSON
    });
});


// Route to get all orders
app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        res.json(results); // Send the results back as JSON
    });
});
// Route to confirm an order
app.post('/confirm-order', (req, res) => {
    const orderDetails = req.body; // Expecting order details in the body of the request

      // Check if orderDetails is an array and not empty
    if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
        return res.status(400).json({ message: 'Invalid order details format. Expected a non-empty array.' });
    }


    // Define the query for inserting order
    const query = 'INSERT INTO orders (product_name, price, quantity) VALUES ?';
    const values = orderDetails.map(item => [item.name, item.price,3]); // Assuming quantity is 1 for simplicity

    // Execute the query
    db.query(query, [values], (err) => {
        if (err) return res.status(500).json({ message: 'Error saving order.' });
        res.status(201).json({ message: 'Order confirmed!' });
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
