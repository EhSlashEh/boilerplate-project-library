'use strict';

const mongoose = require('mongoose')
const Book = require("../models").Book;

module.exports = function (app) {

  app.route('/api/books')

    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (err) {
        res.status(500).json([]);
      }
    })
    
    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) {
        return res.status(400).send("missing required field title");
      }
      try {
        const newBook = new Book({ title, comments: [] });
        const savedBook = await newBook.save();
        res.status(201).json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.status(500).send("there was an error saving");
      }
    })
    
    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        res.status(500).send("error");
      }
    });
  
  app.route('/api/books/:id')  

    .get(async (req, res) => {
      const bookid = req.params.id;
      try {
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.status(404).send("no book exists");
        }
  
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
        console.error(err);
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
        res.status(500).send("there was an error adding the comment");
      }
    })
    
    .delete(async (req, res) => {
      const bookid = req.params.id;
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          return res.status(404).send("no book exists");
        }
        res.send("delete successful");
      } catch (err) {
        res.status(500).send("no book exists");
      }
    });

};
