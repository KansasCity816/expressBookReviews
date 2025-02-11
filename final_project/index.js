const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
// Get the JWT token from the request header or query parameter
    const token = req.headers.authorization; // Assuming token is passed in the Authorization header
    
    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, "your_secret_key"); // Replace "your_secret_key" with your actual secret key

        // Token is valid, proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Token is invalid or expired
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
