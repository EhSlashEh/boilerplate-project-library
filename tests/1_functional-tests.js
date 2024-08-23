const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const $ = require('jquery'); // Ensure you have jQuery available

chai.use(chaiHttp);

describe('Functional Tests', function() {

  // Test POST /api/books with title and missing title
  describe('POST /api/books', function() {
    it('should create a book with title', async function() {
      try {
        let url = '/api/books';
        let data1 = await chai.request(server).post(url).send({ title: 'Faux Book 1' });
        assert.isObject(data1.body);
        assert.property(data1.body, 'title');
        assert.equal(data1.body.title, 'Faux Book 1');
        assert.property(data1.body, '_id');

        let data2 = await chai.request(server).post(url).send({});
        assert.isString(data2.text);
        assert.equal(data2.text, 'missing required field title');
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

  // Test GET /api/books to retrieve all books
  describe('GET /api/books', function() {
    it('should return all books', async function() {
      try {
        let url = '/api/books';
        let a = chai.request(server).post(url).send({ title: 'Faux Book A' });
        let b = chai.request(server).post(url).send({ title: 'Faux Book B' });
        let c = chai.request(server).post(url).send({ title: 'Faux Book C' });
        await Promise.all([a, b, c]);

        let data = await chai.request(server).get(url);
        assert.isArray(data.body);
        assert.isAtLeast(data.body.length, 3);
        data.body.forEach((book) => {
          assert.isObject(book);
          assert.property(book, 'title');
          assert.isString(book.title);
          assert.property(book, '_id');
          assert.property(book, 'commentcount');
          assert.isNumber(book.commentcount);
        });
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

  // Test GET /api/books/{_id} to retrieve a single book
  describe('GET /api/books/:id', function() {
    it('should return a single book by ID', async function() {
      try {
        let url = '/api/books';
        let noBook = await chai.request(server).get(url + '/5f665eb46e296f6b9b6a504d');
        assert.isString(noBook.text);
        assert.equal(noBook.text, 'no book exists');

        let sampleBook = await chai.request(server).post(url).send({ title: 'Faux Book Alpha' });
        assert.isObject(sampleBook.body);
        let bookId = sampleBook.body._id;
        let bookQuery = await chai.request(server).get(url + '/' + bookId);
        assert.isObject(bookQuery.body);
        assert.property(bookQuery.body, 'title');
        assert.equal(bookQuery.body.title, 'Faux Book Alpha');
        assert.property(bookQuery.body, 'comments');
        assert.isArray(bookQuery.body.comments);
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

  // Test POST /api/books/{_id} to add a comment
  describe('POST /api/books/:id/comments', function() {
    it('should add a comment to a book', async function() {
      try {
        let url = '/api/books';
        let commentTarget = await chai.request(server).post(url).send({ title: 'Notable Book' });
        assert.isObject(commentTarget.body);
        let bookId = commentTarget.body._id;

        let bookCom1 = await chai.request(server).post(url + '/' + bookId).send({ comment: 'This book is fab!' });
        let bookCom2 = await chai.request(server).post(url + '/' + bookId).send({ comment: 'I did not care for it' });

        assert.isObject(bookCom2.body);
        assert.property(bookCom2.body, '_id');
        assert.property(bookCom2.body, 'title');
        assert.property(bookCom2.body, 'comments');
        assert.lengthOf(bookCom2.body.comments, 2);
        bookCom2.body.comments.forEach((comment) => {
          assert.isString(comment);
          assert.oneOf(comment, ['This book is fab!', 'I did not care for it']);
        });

        let commentErr = await chai.request(server).post(url + '/' + bookId).send({});
        assert.isString(commentErr.text);
        assert.equal(commentErr.text, 'missing required field comment');

        let failingComment = await chai.request(server).post(url + '/5f665eb46e296f6b9b6a504d').send({ comment: 'Never Seen Comment' });
        assert.isString(failingComment.text);
        assert.equal(failingComment.text, 'no book exists');
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

  // Test DELETE /api/books/{_id} to delete a book
  describe('DELETE /api/books/:id', function() {
    it('should delete a book by ID', async function() {
      try {
        let url = '/api/books';
        let deleteTarget = await chai.request(server).post(url).send({ title: 'Deletable Book' });
        assert.isObject(deleteTarget.body);
        let bookId = deleteTarget.body._id;

        let doDelete = await chai.request(server).delete(url + '/' + bookId);
        assert.isString(doDelete.text);
        assert.equal(doDelete.text, 'delete successful');

        let failingDelete = await chai.request(server).delete(url + '/5f665eb46e296f6b9b6a504d');
        assert.isString(failingDelete.text);
        assert.equal(failingDelete.text, 'no book exists');
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

  // Test DELETE /api/books to delete all books
  describe('DELETE /api/books', function() {
    it('should delete all books', async function() {
      try {
        const deleteAll = await chai.request(server).delete('/api/books');
        assert.isString(deleteAll.text);
        assert.equal(deleteAll.text, 'complete delete successful');
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  });

});
