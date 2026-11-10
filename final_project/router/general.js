const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop using Async/Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "ISBN not found" });
    }
  });

  getBookByISBN
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Get book details based on author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = () => new Promise((resolve, reject) => {
      const filteredBooks = Object.keys(books)
        .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
        .map(key => ({
          isbn: key,
          title: books[key].title,
          reviews: books[key].reviews
        }));
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "No books found for this author" });
      }
    });

    const result = await getBooksByAuthor();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Get all books based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const getBooksByTitle = () => new Promise((resolve, reject) => {
      const filteredBooks = Object.keys(books)
        .filter(key => books[key].title.toLowerCase() === title.toLowerCase())
        .map(key => ({
          isbn: key,
          author: books[key].author,
          reviews: books[key].reviews
        }));
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "No books found with this title" });
      }
    });

    const result = await getBooksByTitle();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "ISBN not found" });
});

module.exports.general = public_users;
