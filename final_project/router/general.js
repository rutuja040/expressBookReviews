const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });
  if (users.some(u => u.username === username))
    return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({ message: "Book not found" });
});

// Get by author
public_users.get('/author/:author', (req, res) => {
  const result = Object.keys(books)
    .filter(k => books[k].author === req.params.author)
    .map(k => ({ isbn: k, ...books[k] }));
  return res.status(200).json({ booksbyauthor: result });
});

// Get by title
public_users.get('/title/:title', (req, res) => {
  const result = Object.keys(books)
    .filter(k => books[k].title === req.params.title)
    .map(k => ({ isbn: k, ...books[k] }));
  return res.status(200).json({ booksbytitle: result });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({ message: "Book not found" });
});

// ---------- Axios versions (promise callbacks / async-await) ----------
const BASE = "http://localhost:5000";

// Task 10: all books (async/await)
public_users.get('/axios/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Task 11: by ISBN (promise)
public_users.get('/axios/isbn/:isbn', (req, res) => {
  axios.get(`${BASE}/isbn/${req.params.isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(500).json({ message: err.message }));
});

// Task 12: by author (async/await)
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Task 13: by title (promise)
public_users.get('/axios/title/:title', (req, res) => {
  axios.get(`${BASE}/title/${encodeURIComponent(req.params.title)}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(500).json({ message: err.message }));
});

module.exports.general = public_users;