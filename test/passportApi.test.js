const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const printObject = require('print-object');

chai.use(chaiHttp);
const expect = chai.expect;

function makeContext(res) {
  return `res.body is\n${printObject(res.body)}error message`;
}

const TEST_PORT = process.env.PORT || 5050;
const backendHost = `http://localhost:${TEST_PORT}`;

describe('passport API', function() {
  it('SignIn non-existent user', function(done) {
      chai.request(backendHost)
        .post('/passport/signin')
        .send({email: 'sikalov@mail.ru', password: '123'})
        .end(function(err, res) {
          expect(res, makeContext(res)).to.have.status(400);
          expect(res.body).to.have.property('message', 'No such user');
          done();
        });
  });

  it('SignIn with missing email', function (done) {
      chai.request(backendHost)
      .post('/passport/signin')
      .send({password: '123'})
      .end(function(err, res) {
        expect(res, makeContext(res)).to.have.status(400);
        expect(res.body).to.have.property('message', 'email is required');
        done();
      });
  })

  it('Successful sign up user', function(done) {
    chai.request(backendHost)
      .post('/passport/signup')
      .send({email: 'sikalov@mail.ru', password: '12345', username: "sikalov"})
      .end(function(err, res) {
        expect(res, makeContext(res)).to.have.status(201);
        expect(res.body).to.have.property('email', 'sikalov@mail.ru');
        expect(res.body).to.have.property('username', 'sikalov');
        expect(res.body).to.have.all.keys(['id', 'email', 'username']);
        done();
      });
  });

  it('Sign up with incorrect email', function(done) {
    chai.request(backendHost)
      .post('/passport/signup')
      .send({email: 'sikalov', password: '12345', username: "sikalov"})
      .end(function(err, res) {
        expect(res, makeContext(res)).to.have.status(400);
        expect(res.body).to.have.property('message', 'Invalid format of email');
        done();
      });
  });

  it('Sign up with incorrect password', function(done) {
    chai.request(backendHost)
      .post('/passport/signup')
      .send({email: 'sikalov@mail.ru', password: '123', username: "sikalov"})
      .end(function(err, res) {
        expect(res, makeContext(res)).to.have.status(400);
        expect(res.body).to.have.property('message');
        done();
      })
  });

  it('Sign In after sign up', function (done) {
    chai.request(backendHost)
    .post('/passport/signin')
    .send({email: 'sikalov@mail.ru', password: '12345'})
    .end(function(err, res) {
      expect(res, makeContext(res)).to.have.status(202);
      expect(res.body).to.have.property('email', 'sikalov@mail.ru');
      expect(res.body).to.have.property('username', 'sikalov');
      expect(res.body).to.have.all.keys(['id', 'email', 'username']);
      done();
    });
  })

  it('Sign In with invalid password', function (done) {
    chai.request(backendHost)
    .post('/passport/signin')
    .send({email: 'sikalov@mail.ru', password: '3'})
    .end(function(err, res) {
      expect(res, makeContext(res)).to.have.status(400);
      expect(res.body).to.have.property('message', 'Invalid password');
      done();
    });
  })
});
