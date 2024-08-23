const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let bookID;
const timeout = 20000;

suite('Functional Tests', function() {

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {      
      
      test('Test POST /api/books with title', function(done) {
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "test-title" })
          .end(function (err, res) {
            assert.equal(res.status, 201);
            bookID = res.body._id;
            assert.equal(res.body.title, "test-title");
            done();
          })
          .timeout(timeout);
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai
          .request(server)
          .post("/api/books")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, "missing required field title");
            done();
          })
          .timeout(timeout);
      });      
    });

    suite('GET /api/books => array of books', function(){      
      test('Test GET /api/books',  function(done){
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "Response should be an array");
            done();
          })
          .timeout(timeout);
      });      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
          .request(server)
          .get("/api/books/invalidID")
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, "no book exists");
            done();
          })
          .timeout(timeout);
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai
          .request(server)
          .get("/api/books/" + bookID)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, "test-title");
            assert.isArray(res.body.comments, "comments should be an array");
            done();
          })
          .timeout(timeout);
      });      
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){   

      test('Test POST /api/books/[id] with comment', function(done){
        chai
          .request(server)
          .post("/api/books/" + bookID)
          .send({ comment: "test-comment" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.comments, "comments should be an array");
            assert.equal(res.body.comments[res.body.comments.length - 1], "test-comment");
            done();
          })
          .timeout(timeout);
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai
          .request(server)
          .post("/api/books/" + bookID)
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, "missing required field comment");
            done();
          })
          .timeout(timeout);
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai
          .request(server)
          .post("/api/books/" + "invalidID")
          .send({ comment: "test-comment" })
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, "no book exists");
            done();
          })
          .timeout(timeout);
      });      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai
          .request(server)
          .delete("/api/books/" + bookID)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          })
          .timeout(timeout);
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai
          .request(server)
          .delete("/api/books/" + "invalidID")
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, "no book exists");
            done();
          })
          .timeout(timeout);
      });
    });
  });
});
