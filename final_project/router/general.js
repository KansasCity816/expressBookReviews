const express = require('express');
let books = require("./booksdb.js"); // books is an object, not an array
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = "your_strong_secret_key"; // Replace with a secure key

const session = require('express-session');
public_users.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Extract username and password

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (users.hasOwnProperty(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Store new user in auth_users.js
    users[username] = { password }; // Save user credentials
    console.log("Updated Users:", users); // Debugging: Log registered users

    return res.status(201).json({ message: "User registered successfully!" });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
    if (!books || typeof books !== 'object') {
        return res.status(500).json({ message: "Books data is not available" });
    }

    // Convert books object to an array
    const booksArray = Object.values(books);

    return res.status(200).json(booksArray);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Directly access the book using its ISBN as a key
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    // Convert books object to an array and filter by author
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "Books by this author not found" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    // Convert books object to an array and filter by title
    const booksWithTitle = Object.values(books).filter(book => book.title === title);

    if (booksWithTitle.length > 0) {
        return res.status(200).json(booksWithTitle);
    } else {
        return res.status(404).json({ message: "Books with this title not found" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        const bookReviews = books[isbn].reviews;

        if (Object.keys(bookReviews).length > 0) {
            return res.status(200).json({ reviews: bookReviews });
        } else {
            return res.status(404).json({ message: "No reviews available for this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
