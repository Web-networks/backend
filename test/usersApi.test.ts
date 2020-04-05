import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
// @ts-ignore
import printObject from 'print-object';
import sh from 'shelljs';
import queryString from 'query-string';

import fixtureUsers from '../fixtures/users.json';

chai.use(chaiHttp);
const { expect } = chai;

function makeContext(res: Record<string, any>) {
    return `res.body is\n${printObject(res.body)}error message`;
}

function makeUrl(url: string, query: Object) {
    return `${url}?${queryString.stringify(query)}`;
}

const backendHost = config.get('appHost');

describe('USERS API', () => {
    before(() => {
        sh.exec('yarn ts-node ./tasks/load-fixtures.ts', { silent: true });
    });

    describe('GET /restapi/users/find', () => {
        it('it should get all users', done => {
            chai.request(backendHost)
                .get('/restapi/users/find')
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(200);
                    expect(res.body).to.have.all.keys(['users']);
                    expect(res.body.users).to.have.length(fixtureUsers.length);
                    done();
                });
        });

        it('it should get users with username filter', done => {
            chai.request(backendHost)
                .get(makeUrl('/restapi/users/find', { username: 'test' }))
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(200);
                    expect(res.body).to.have.all.keys(['users']);
                    expect(res.body.users).to.have.length(2);
                    done();
                });
        });
    });
});
