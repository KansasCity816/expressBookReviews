const jwt = require('jsonwebtoken');
let users = {}; // Ensure this is globally accessible
const secretKey = "your_strong_secret_key"; // Use a strong secret key

// Function to authenticate a user
function authenticateUser(username, password) {
    console.log("Users in memory before login:", users); // Debugging

    // Ensure username exists and password matches
    if (users[username] && users[username].password === password) {
        console.log("Login successful for:", username); // Debugging
        return true;
    } else {
        console.log("Login failed for:", username, "with password:", password); // Debugging
        return false;
    }
}

// Route for customer login
function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticateUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    // Store token in session
    req.session.accessToken = token;

    return res.status(200).json({ message: "Login successful!", token });
}

// Export users and authentication route
module.exports = { users, login };
