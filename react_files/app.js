const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const saltRounds = 10;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files (CSS, JS, Images, HTML) from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

//Example route for serving dashboard HTML page
app.get('/sellerdashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_seller', 'sellerdashboard.html'));
});
  
//route to serve product_listing page
app.get('/product_listing', (req, res) =>{
  res.sendFile(path.join(__dirname,'public_product_list','product_listing.html'));
});
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

// POST route for handling seller sign up
app.post('/signup', (req, res) => {
  const { username, email, password,user_type} = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
 
  // Hash password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Error hashing password.' });

    const query = `INSERT INTO user_data (user_data, email, password_hash,user_type) VALUES (?, ?, ?,?)`;
    db.query(query, [username, email, hash,user_type], (err) => {
      if (err) return res.status(500).json({ message: 'Database error.' });
      res.status(201).json({ message: 'User created successfully.' });
    });
  });
});

// POST route for client signup
app.post('/signup-client', (req, res) => {
  const { clientname, email, password,user_type} = req.body;

  if (!clientname|| !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
 
  // Hash password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Error hashing password.' });

    const query = `INSERT INTO user_data (user_data, email, password_hash,user_type) VALUES (?, ?, ?,?)`;
    db.query(query, [clientname, email, hash,user_type], (err) => {
      if (err) return res.status(500).json({ message: 'Database error.' });
      res.status(201).json({ message: 'User created successfully.' });
    });
  });
});

// POST route for handling login
app.post('/login', (req, res) => {
  const { email, password,user_type} = req.body;

  if (!email || !password || ! user_type) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  // Query user by email
  const query = `SELECT * FROM user_data WHERE email = ? AND user_type = ?`;
  db.query(query, [email,user_type], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare hashed password
    bcrypt.compare(password, results[0].password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Error comparing passwords.' });

      if (isMatch) {
        return res.status(200).json({ message: 'Login successful.' });
      } else {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
