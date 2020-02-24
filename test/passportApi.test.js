const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const printObject = require('print-object');
const sh = require('shelljs');

chai.use(chaiHttp);
const expect = chai.expect;

function makeContext(res) {
  return `res.body is\n${printObject(res.body)}error message`;
}

const backendHost = config.get('appHost');

describe('PASSPORT API', function() {
  before(() => {
    sh.exec('node ./tasks/load-fixtures.js', { silent: true, env: process.env });
  })

  describe('POST /passport/signin', function() {
    it('it should successfully sign in', function(done) {
      chai.request(backendHost)
        .post('/passport/signin')
        .send({email: 'user1@mail.ru', password: 'user1'})
        .end(function(err, res) {
          expect(res, makeContext(res)).to.have.status(202);
          expect(res.body).to.have.all.keys(['id', 'username', 'email']);
          done();
        });
  });
  
    it('it should not sign in with unexisted user', function(done) {
        chai.request(backendHost)
          .post('/passport/signin')
          .send({email: 'unexisted@mail.ru', password: '123'})
          .end(function(err, res) {
            expect(res, makeContext(res)).to.have.status(400);
            expect(res.body).to.have.property('message', 'No such user');
            done();
          });
    });
  
    it('it should not sign in with missing email', function (done) {
        chai.request(backendHost)
        .post('/passport/signin')
        .send({password: '123'})
        .end(function(err, res) {
          expect(res, makeContext(res)).to.have.status(400);
          expect(res.body).to.have.property('message', 'email is required');
          done();
        });
    })

    it('it should not sign in with ivalid password', function (done) {
      chai.request(backendHost)
      .post('/passport/signin')
      .send({email: 'user1@mail.ru', password: '3'})
      .end(function(err, res) {
        expect(res, makeContext(res)).to.have.status(400);
        expect(res.body).to.have.property('message', 'Invalid password');
        done();
      });
    })
  })

  describe('POST /passport/signup', function() {
    it('it should sign up with success', function(done) {
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
  
    it('it should not sign up with incorrect email', function(done) {
      chai.request(backendHost)
        .post('/passport/signup')
        .send({email: 'sikalov', password: '12345', username: "sikalov"})
        .end(function(err, res) {
          expect(res, makeContext(res)).to.have.status(400);
          expect(res.body).to.have.property('message', 'email has wrong format');
          done();
        });
    });

    it('it should sign up with incorrect password', function(done) {
      chai.request(backendHost)
        .post('/passport/signup')
        .send({email: 'sikalov@mail.ru', password: '123', username: "sikalov"})
        .end(function(err, res) {
          expect(res, makeContext(res)).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        })
    });
  })
});
