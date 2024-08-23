'use strict';

const Book = require("../models").Book;

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        if (!books) {
          return res.json([]);
        }
        const formatData = books.map((book) => ({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length,
        }));
        res.json(formatData);
      } catch (err) {
        res.status(500).json([]);
      }
    })
    
    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) {
        return res.status(400).send("missing required field title");
      }
      const newBook = new Book({ title, comments: [] });
      try {
        const book = await newBook.save();
        res.status(201).json({ _id: book._id, title: book.title });
      } catch (err) {
        res.status(500).send("there was an error saving");
      }    
    })
    
    .delete(async (req, res) => {
      try {
        await Book.deleteMany();
        res.send("complete delete successful");
      } catch (err) {
        res.status(500).send("error");
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send("no book exists");
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length,
        });
      } catch (err) {
        res.status(500).send("no book exists");
      }
    })
    
    .post(async (req, res) => {
      const bookid = req.params.id;
      const { comment } = req.body;
      if (!comment) {
        return res.status(400).send("missing required field comment");
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send("no book exists");
        }
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length,
        });
      } catch (err) {
        res.status(500).send("no book exists");
      }
    })
    
    .delete(async (req, res) => {
      const bookid = req.params.id;
      try {
        const deleted = await Book.findByIdAndDelete(bookid);
        if (!deleted) {
          return res.status(404).send("no book exists");
        }
        res.send("delete successful");
      } catch (err) {
        res.status(500).send("no book exists");
      }
    });
  
};
