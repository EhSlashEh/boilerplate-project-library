'use strict';

const mongoose = require('mongoose');
const Book = require("../models").Book;

module.exports = function (app) {

  app.route('/api/books')

    .get(async (req, res) => {
      console.log("GET /api/books received");

      try {
        const books = await Book.find({});
        console.log("Books found:", books);

        if (books.length === 0) {
          return res.status(404).send("no book exists");
        }

        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length
        }));
        
        res.json(formattedBooks);
      } catch (err) {
        console.error("Error retrieving books:", err);
        res.status(500).json([]);
      }
    })
    
    .post(async (req, res) => {
      const { title } = req.body;
      console.log("POST /api/books received with title:", title);

      if (!title) {
        console.log("Title is missing");
        return res.status(400).send("missing required field title");
      }

      try {
        const newBook = new Book({ title, comments: [] });
        const savedBook = await newBook.save();
        console.log("Book created:", savedBook);
        res.status(201).json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        console.error("Error saving book:", err);
        res.status(500).send("there was an error saving");
      }
    })
    
    .delete(async (req, res) => {
      console.log("DELETE /api/books received");

      try {
        await Book.deleteMany({});
        console.log("All books deleted successfully");
        res.send("complete delete successful");
      } catch (err) {
        console.error("Error deleting all books:", err);
        res.status(500).send("error");
      }
    });
  
  app.route('/api/books/:id')  

    .get(async (req, res) => {
      
      const bookid = req.params.id;
      console.log("GET /api/books/:id received with id:", bookid);

      try {
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
          console.log("Invalid ID:", bookid);
          return res.status(404).send("no book exists");
        }

        const book = await Book.findById(bookid);
        if (!book) {
          console.log("Book not found for id:", bookid);
          return res.status(404).send("no book exists");
        }

        console.log("Book found:", book);
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length,
        });
      } catch (err) {
        console.error("Error retrieving book:", err);
        res.status(500).send("error occurred while retrieving book");
      }
    })
    
    .post(async (req, res) => {
      const bookid = req.params.id;
      const { comment } = req.body;
      console.log("POST /api/books/:id received with id:", bookid, "and comment:", comment);

      if (!comment) {
        console.log("Comment is missing");
        return res.status(400).send("missing required field comment");
      }
      
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        console.log("Invalid ID:", bookid);
        return res.status(404).send("no book exists");
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          console.log("Book not found for id:", bookid);
          return res.status(404).json({ error: "no book exists" });
        }
        book.comments.push(comment);
        await book.save();

        console.log("Comment added. Updated book:", book);
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
          commentcount: book.comments.length,
        });
      } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).send("there was an error adding the comment");
      }
    })
    
    .delete(async (req, res) => {
      const bookid = req.params.id;
      console.log("DELETE /api/books/:id received with id:", bookid);

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        console.log("Invalid ID:", bookid);
        return res.status(404).send("no book exists");
      }

      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          console.log("Book not found for id:", bookid);
          return res.status(404).send("no book exists");
        }

        console.log("Book deleted:", deletedBook);
        res.send("delete successful");
      } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send("no book exists");
      }
    });

};
