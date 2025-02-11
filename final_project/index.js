const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const { login } = require('./router/auth_users.js'); // Import login function
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Initialize session middleware
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Mount customer login route
app.post("/customer/login", login);

// Middleware for authentication for routes under "/customer/auth/*"
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1] || req.session.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, "your_strong_secret_key");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
});

// Mount other routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(5000, () => console.log("Server is running on port 5000"));
