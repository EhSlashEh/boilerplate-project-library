const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Book = require('../models').Book;

const app = express();
app.use(bodyParser.json());

// POST /api/books
app.post('/api/books', async (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.json({ error: 'missing required field title' });
  }
  
  try {
    const book = new Book({ title });
    await book.save();
    res.json({ title: book.title, _id: book._id });
  } catch (err) {
    res.json({ error: 'could not create book' });
  }
});

// GET /api/books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books.map(book => ({
      _id: book._id,
      title: book.title,
      commentcount: book.comments.length
    })));
  } catch (err) {
    res.json({ error: 'could not retrieve books' });
  }
});

// GET /api/books/:id
app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.json({ error: 'no book exists' });
    }
    res.json({
      _id: book._id,
      title: book.title,
      comments: book.comments
    });
  } catch (err) {
    res.json({ error: 'could not retrieve book' });
  }
});

// POST /api/books/:id/comments
app.post('/api/books/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  
  if (!comment) {
    return res.json({ error: 'missing required field comment' });
  }
  
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.json({ error: 'no book exists' });
    }
    book.comments.push(comment);
    await book.save();
    res.json({
      _id: book._id,
      title: book.title,
      comments: book.comments
    });
  } catch (err) {
    res.json({ error: 'could not add comment' });
  }
});

// DELETE /api/books/:id
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await Book.findByIdAndDelete(id);
    if (result) {
      res.json({ result: 'delete successful' });
    } else {
      res.json({ error: 'no book exists' });
    }
  } catch (err) {
    res.json({ error: 'could not delete book' });
  }
});

// DELETE /api/books
app.delete('/api/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.json({ result: 'complete delete successful' });
  } catch (err) {
    res.json({ error: 'could not delete all books' });
  }
});

module.exports = app;
