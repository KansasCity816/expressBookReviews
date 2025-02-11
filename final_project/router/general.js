const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js"); 
let users = require("./auth_users.js").users;
const public_users = express.Router();
const session = require('express-session');

public_users.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// 🔹 Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password }; 
    console.log("New User Registered:", users); 

    return res.status(201).json({ message: "User registered successfully!" });
});

// 🔹 Get the book list using **Promises**
public_users.get("/", (req, res) => {
    new Promise((resolve, reject) => {
        if (books && typeof books === "object") {
            resolve(Object.values(books)); // Convert object to array
        } else {
            reject("Books data is not available");
        }
    })
    .then(bookList => res.status(200).json(bookList))
    .catch(error => res.status(500).json({ message: error }));
});

// 🔹 Get the book list using **Async/Await with Axios**
public_users.get("/async", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// 🔹 Get book details by ISBN (Book ID) using **Promises**
public_users.get('/isbn/:bookId', (req, res) => {
    const bookId = req.params.bookId;

    new Promise((resolve, reject) => {
        if (books[bookId]) {
            resolve(books[bookId]);
        } else {
            reject("Book not found");
        }
    })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ message: error }));
});

// 🔹 Get book details by ISBN (Book ID) using **Async/Await with Axios**
public_users.get('/async/isbn/:bookId', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${req.params.bookId}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// 🔹 Get book details by Author using **Promises**
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("Books by this author not found");
        }
    })
    .then(bookList => res.status(200).json(bookList))
    .catch(error => res.status(404).json({ message: error }));
});

// 🔹 Get book details by Author using **Async/Await with Axios**
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Books by this author not found", error: error.message });
    }
});

// 🔹 Get book details by Title using **Promises**
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        const booksWithTitle = Object.values(books).filter(book => book.title === title);

        if (booksWithTitle.length > 0) {
            resolve(booksWithTitle);
        } else {
            reject("Books with this title not found");
        }
    })
    .then(bookList => res.status(200).json(bookList))
    .catch(error => res.status(404).json({ message: error }));
});

// 🔹 Get book details by Title using **Async/Await with Axios**
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Books with this title not found", error: error.message });
    }
});

// 🔹 Get book review
public_users.get('/review/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    if (books[bookId]) {
        const bookReviews = books[bookId].reviews;
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
