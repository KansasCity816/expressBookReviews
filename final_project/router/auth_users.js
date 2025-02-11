const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js'); // Import books database
let users = {}; 
const secretKey = "your_strong_secret_key"; 

// Function to authenticate a user
function authenticateUser(username, password) {
    return users[username] && users[username].password === password;
}

// Route for customer login
function login(req, res) {
    console.log("Users in memory:", users);  // Debugging - Show registered users in the console

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticateUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    req.session.accessToken = token;
    req.session.username = username;

    return res.status(200).json({ message: "Login successful!", token });
}

// 🔹 Protected profile route
router.get('/profile', (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json({ message: `Welcome, ${req.session.username}!` });
});

// Add or Modify Book Review
router.put("/auth/review/:bookId", (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { bookId } = req.params;
    const review = req.body.review; // Ensure we correctly extract `review`

    console.log("Incoming request body:", req.body); // Debugging
    console.log("Extracted review:", review); // Debugging

    if (!review || typeof review !== "string" || review.trim() === "") {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    console.log("Checking if book exists:", books[bookId]); // Debugging
    if (!books[bookId]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Initialize reviews if none exist
    if (!books[bookId].reviews) {
        books[bookId].reviews = {};
    }

    // Add or modify the review
    books[bookId].reviews[username] = review;

    console.log(`Updated reviews for Book ID ${bookId}:`, books[bookId].reviews); // Debugging

    return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[bookId].reviews });
});

// Delete a Book Review
router.delete("/auth/review/:bookId", (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { bookId } = req.params;

    console.log(`Deleting review for Book ID: ${bookId} by user: ${username}`); // Debugging

    // Check if the book exists
    if (!books[bookId]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if reviews exist
    if (!books[bookId].reviews || !books[bookId].reviews[username]) {
        return res.status(404).json({ message: "Review not found or you don't have permission to delete it." });
    }

    // Delete the user's review
    delete books[bookId].reviews[username];

    console.log(`Updated reviews after deletion for Book ID ${bookId}:`, books[bookId].reviews); // Debugging

    return res.status(200).json({ message: "Review deleted successfully." });
});

// Export users and authentication route
module.exports = { users, login, authenticated: router };
