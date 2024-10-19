const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
//const { emit } = require('process');
const nodemailer = require('nodemailer');
const session = require('express-session');

const app = express();
const saltRounds = 10;

// Middleware to parse JSON
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'your_secret_key', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));


// Serve static files (CSS, JS, Images, HTML) from 'public'
app.use(express.static(path.join(__dirname, 'public')));

//serve the static from public_seller
app.use(express.static('public_seller'));

//code for parse incoming JSON request
app.use(express.json());


//check the seller login error
app.use((req,res,next)=>{
  console.log(`request URL:${req.url}`);
  next();
});


// Route to serve login page
app.get('/login-seller', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','login-seller.html'));
});

//route to serve login page
app.get('/login-client',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','login-client.html'))
})

// Route to serve signup page
/*app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});*/

//Example route for serving dashboard HTML page
app.get('/sellerdashboard', (req, res) => {
  res.sendFile(path.join(__dirname,  'public_seller','sellerdashboard.html'));
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
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
  }

  // Query to insert seller
  const query = `INSERT INTO seller (name, email, password) VALUES (?, ?, ?)`;
  db.query(query, [name, email, password], (err, result) => {
    console.log("Executing DB query...");

    // Handle database error
    if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error.' });
    }
    
    console.log('Insert result:', result);

    const sellerID = result.insertId; // Get the inserted ID
    console.log('Seller ID:', sellerID); // Log the Seller ID

    // Set up email transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vigneshwaranmca22@gmail.com',
            pass: 'mdqi zubh ucjt vamv', // Ensure you use an App Password if 2FA is enabled
        },
    });

    console.log('Email transporter created successfully.');

    // Email options
    const mailOptions = {
        from: 'vigneshwaranmca22@gmail.com',
        to: email,
        subject: 'Welcome to AgriMinds productly present for Agriculture',
        text: `Hello ${name},\n\nThank you for creating your account in AgriMinds. Your Seller ID is ${sellerID},\n\nBest Regards,\n[AgriMinds]`,
    };

    console.log('Mail options configured:', mailOptions);

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Signup successful, but email could not be sent.' });
        }
        console.log('Email sent:', info.response);
        
    
          return res.status(200).json({ message: 'User created successfully.' });
        // console.log('Redirecting to Google...');
        // res.redirect('/login-seller.html');
    });
});

});

//});

// POST route for client signup
app.post('/signup-client', (req, res) => {
  const { name, email, password} = req.body;

  if (!name|| !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
 
  /*Hash password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Error hashing password.' });
*/

    const query = `INSERT INTO client (name, email, password) VALUES (?, ?, ?)`;
    db.query(query, [name, email, password], (err) => {
      if (err) return res.status(500).json({ message: 'Database error.' });
      res.status(201).json({ message: 'User created successfully.' });
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other email services like Yahoo, Outlook, etc.
      auth: {
          user: 'vigneshwaranmca22@gmail.com', // Your Gmail address or email service
          pass: 'mdqi zubh ucjt vamv', // Your email password or an App Password if 2FA is enabled
      },
  });
  const mailOptions = {
    from: 'vigneshwaranmca22@gmail.com', // Sender address
    to: email, // Receiver's email, which is the registered user's email
    subject: 'Welcome to AgriMinds', // Subject of the email
    text: `Hello ${name},\n\nThank you for creating your account in AgriMinds We are glad to have you on board.\n\nBest Regards,\n[AgriMinds]`, // Plain text body
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Signup successful, but email could not be sent.' });
  }
  console.log('Email sent:', info.response);
  res.status(200).json({ message: 'Signup successful, confirmation email sent.' });
});
  });
//});

//post route for login-client 
// Client login route
app.post('/login-client', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  const query = `SELECT ID FROM client WHERE email = ? AND password = ?`;
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const clientID = results[0].ID; // Properly assign the client ID here
    res.status(200).json({ message: 'Login successful.', client_id: clientID });
  });
});



//post route for login-seller

app.post('/login-seller', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
  }

  // Query to select the seller based on email and password
  const query = `SELECT ID FROM seller WHERE email = ? AND password = ?`;
  db.query(query, [email, password], (err, results) => {
      // Handle database errors
      if (err) return res.status(500).json({ message: 'Database error.' });
      
      // Check if a seller was found
      if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Retrieve the seller ID from the results
      const sellerId = results[0].ID; // Assuming ID is the name of your seller ID column

      // Send a successful response with the seller ID
      res.status(200).json({
          message: 'Login successful.',
          seller_id: sellerId // Include seller ID in the response
      });
  });
});


  //route to serve product_listing 
  app. get('/product_listing',(req,res)=>{
    res.sendFile(path.join(__dirname,'public_product_list','product_lisiting.html'));

  });

  //route to serve sellerdashboard
  app.get('/sellerdashboard',(req,res)=>{
    if(!req.session.sellerID){
      return res.status(401).json({message:'please login to access dashboard'})
    }
    const sellerID = req.session.sellerID;
    const query =`SELECT * FROM products WHERE seller_id= ?`;
db.query(query,[sellerID],(err,results)=>{
  if (err) return req.status(500).json({message:'database error'});

});
    if(!sellerID){
      return res.status(403).json({message:'unauthirized access'});
  
    }

    res.sendFile(path.join(__dirname,'public_seller','sellerdashboard.html'));
  });

  //logout  for session
  
  /*// Query user by email
  const query = `SELECT * FROM user_data WHERE email = ? AND user_type = ?`;
  db.query(query, [email,user_type], (err, results) => {
    console.log(results);
    if (err) return res.status(500).json({ message: 'Database error.' });
    

    console.log(results);
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare hashed password
    bcrypt.compare(password, results[0].password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Error comparing passwords.' });

      if (isMatch) {
        if(user_type ==='admin'){
          return res.status(200).json({message:'login successfull',user_type:'admiin'});
        }
        else{
          //redirest to seller or client
          return res.status(200).json({message:'login successfull',user_type:results[0].user_type});
        }

      }else{
        return req.status(400).json({message:'Invalid email or pasword'});

      }
        
    

      
    });*/
  //});


//serve the admin dashboard page
app.get('/admin',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','admin.html'));

});

//fetch all the users for the admin 
app.get('/admin/users',(req,res)=>{
  const query ='SELECT * from seller';
  db.query(query,(err,results)=>{
    if(err)return res.status(500).json({message:'database error'});
    res.status(200).json(results);
  });
});
 
//add product
app.post('/admin/add-product',(req,res)=>{
  const {productname,productprice}= req.body;


  const query='INSERT INTO products (name,price) VALUES (?.?)';
  db.query (query, [productname,productprice],(err)=>{
    if(err)return res.status(500).json({message:'error adding product'});
    res.status(201).json({message:'product added succesfully'});

  });
});
// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
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
  console.log('Request body:', req.body); // Log the request body
  const { seller_id, product_name, price, description, image_url } = req.body;

  // Validate input
  if (!seller_id || !product_name || !price || !description || !image_url) {
      return res.status(400).json({ message: 'Please fill all fields.' });
  }

  // Check if seller exists before adding a product
  const sellerCheckQuery = 'SELECT * FROM seller WHERE id = ?';
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
// app.put('/edit-product/:id', (req, res) => {
//     const { product_name, price, description, image_url } = req.body;
//     const { id } = req.params;

//     if (!product_name || !price || !description || !image_url) {
//         return res.status(400).json({ message: 'Please fill all fields.' });
//     }

//     const query = 'UPDATE products SET product_name = ?, price = ?, description = ?, image_url = ? WHERE id = ?';
//     db.query(query, [product_name, price, description, image_url, id], (err) => {
//         if (err) {
//             console.error('Database Error: ', err);
//             return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
//         }
//         res.status(200).json({ message: 'Product updated successfully.' });
//     });
// });

// PUT route to edit an existing product
app.put('/edit-product/:id', (req, res) => {
  const { product_name, price, description, image_url } = req.body;
  const { id } = req.params;

  console.log('Request Body:', req.body);  // Log the incoming body
  console.log('Request Params:', req.params); // Log the incoming params

  // Validate input fields
  if (!product_name || !price || !description || !image_url) {
      return res.status(400).json({ message: 'Please fill all fields.' });
  }

  const query = 'UPDATE products SET product_name = ?, price = ?, description = ?, image_url = ? WHERE id = ?';
  db.query(query, [product_name, price, description, image_url, id], (err, results) => {
      if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ message: 'Database error: ' + err.sqlMessage });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Product not found.' });
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
  const query = 'INSERT INTO orders (product_name, price, quantity, client_id) VALUES ?';
  const values = orderDetails.map(item => [item.name, item.price,3,32]); // Assuming quantity is 1 for simplicity

  // Execute the query
  db.query(query, [values], (err) => {
      if (err) return res.status(500).json({ message: 'Error saving order.' });
      res.status(201).json({ message: 'Order confirmed!' });
  });
});






// Example route for serving admin dashboard HTML page
app.get('admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin','admin.html'));
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
  const { seller_id, product_name, price, description, image_url } = req.body;
  const query = `INSERT INTO products (seller_id, product_name, price, description, image_url) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [seller_id, product_name, price, description, image_url], (err) => {
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
  const query = `DELETE FROM client WHERE id = ?`;
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

