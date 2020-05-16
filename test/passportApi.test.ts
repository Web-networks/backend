import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
// @ts-ignore
import printObject from 'print-object';
import sh from 'shelljs';

chai.use(chaiHttp);
const { expect } = chai;

function makeContext(res: Record<string, any>) {
    return `res.body is\n${printObject(res.body)}error message`;
}

const backendHost = config.get('appHost');

describe('PASSPORT API', () => {
    before(() => {
        sh.exec('yarn ts-node ./tasks/load-fixtures.ts', { silent: true });
    });

    describe('POST /passport/signin', () => {
        it('it should successfully sign in', done => {
            chai.request(backendHost)
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(202);
                    expect(res.body).to.have.all.keys(['id', 'username', 'email', 'avatar', 'firstName', 'lastName']);
                    done();
                });
        });

        it('it should not sign in with unexisted user', done => {
            chai.request(backendHost)
                .post('/passport/signin')
                .send({ email: 'unexisted@mail.ru', password: '123' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message', 'No such user');
                    done();
                });
        });

        it('it should not sign in with missing email', done => {
            chai.request(backendHost)
                .post('/passport/signin')
                .send({ password: '123' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message', 'Email is required');
                    done();
                });
        });

        it('it should not sign in with invalid password', done => {
            chai.request(backendHost)
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: '3' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message', 'Invalid password');
                    done();
                });
        });
    });

    describe('POST /passport/signup', () => {
        it('it should sign up with success', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'sikalov@mail.ru', password: '12345', username: 'sikalov' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(201);
                    expect(res.body).to.have.property('email', 'sikalov@mail.ru');
                    expect(res.body).to.have.property('username', 'sikalov');
                    expect(res.body).to.have.all.keys(['id', 'email', 'username', 'avatar', 'firstName', 'lastName']);
                    done();
                });
        });

        it('it should not sign up with incorrect email', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'sikalov', password: '12345', username: 'sikalov' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message', 'Invalid email');
                    done();
                });
        });

        it('it should sign up with incorrect password', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'sikalov@mail.ru', password: '123', username: 'sikalov' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
    });
});
