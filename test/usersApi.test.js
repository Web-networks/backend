const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const printObject = require('print-object');
const sh = require('shelljs');
const queryString = require('query-string');

const fixtureUsers = require('../fixtures/users.json')

chai.use(chaiHttp);
const expect = chai.expect;

function makeContext(res) {
  return `res.body is\n${printObject(res.body)}error message`;
}

function makeUrl(url, query) {
    return `${url}?${queryString.stringify(query)}`;
}

const backendHost = config.get('appHost');

describe('USERS API', function() {
    before(() => {
        sh.exec('node ./tasks/load-fixtures.js', { silent: true, env: process.env });
    })

    describe('GET /restapi/users/find', function() {
        it('it should get all users', function(done) {
            chai.request(backendHost)
            .get('/restapi/users/find')
            .end(function(err, res) {
                expect(res, makeContext(res)).to.have.status(200);
                expect(res.body).to.have.all.keys(['users']);
                expect(res.body.users).to.have.length(fixtureUsers.length);
                done();
            });
        });
        
        it('it should get users with username filter', function(done) {
            chai.request(backendHost)
                .get(makeUrl('/restapi/users/find', { username: 'test' }))
                .end(function(err, res) {
                    expect(res, makeContext(res)).to.have.status(200);
                    expect(res.body).to.have.all.keys(['users']);
                    expect(res.body.users).to.have.length(2);
                    done();
                })
        })
    })
});
