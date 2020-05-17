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

        it('it should not sign up with incorrect password', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'sikalov@mail.ru', password: '123', username: 'sikalov' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });

        it('it should sign up with first name', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'user100@mail.ru', password: '12345', username: 'user100', firstName: 'Name' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(201);
                    expect(res.body).to.have.property('firstName', 'Name');
                    done();
                });
        });

        it('it should sign up with last name', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'user101@mail.ru', password: '12345', username: 'user101', lastName: 'Name' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(201);
                    expect(res.body).to.have.property('lastName', 'Name');
                    done();
                });
        });

        it('it should sign up with first and last names', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'user102@mail.ru', password: '12345', username: 'user102', firstName: 'FirstName', lastName: 'LastName' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(201);
                    expect(res.body).to.have.property('firstName', 'FirstName');
                    expect(res.body).to.have.property('lastName', 'LastName');
                    done();
                });
        });

        it('it should not sign up with incorrect first name', done => {
            chai.request(backendHost)
                .post('/passport/signup')
                .send({ email: 'user103@mail.ru', password: '12345', username: 'user103', firstName: 'N'})
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(400);
                    expect(res.body).to.have.property('message', 'First name must be not less then 3 symbols');
                    done();
                });
        });
    });

    describe('POST /passport/editinfo', () => {
        it('it should successfully edit first name', done => {
            var chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end((err, res) => {
                    chaiReq
                        .post('/passport/editinfo')
                        .send({ firstName: 'FirstName' })
                        .end((err, res) => {
                            expect(res, makeContext(res)).to.have.status(202);
                            expect(res.body).to.have.property('firstName', 'FirstName');
                            done();
                        });
                });
        });

        it('it should successfully edit last name', done => {
            var chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end((err, res) => {
                    chaiReq
                        .post('/passport/editinfo')
                        .send({ lastName: 'LastName' })
                        .end((err, res) => {
                            expect(res, makeContext(res)).to.have.status(202);
                            expect(res.body).to.have.property('lastName', 'LastName');
                            done();
                        });
                });
        });

        it('it should successfully edit first and last names together', done => {
            var chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end((err, res) => {
                    chaiReq
                        .post('/passport/editinfo')
                        .send({ firstName: 'FirstName', lastName: 'LastName' })
                        .end((err, res) => {
                            expect(res, makeContext(res)).to.have.status(202);
                            expect(res.body).to.have.property('firstName', 'FirstName');
                            expect(res.body).to.have.property('lastName', 'LastName');
                            done();
                        });
                });
        });

        it('it should not edit first name when unauthorized', done => {
            chai.request(backendHost)
                .post('/passport/editinfo')
                .send({ firstName: 'FirstName' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(401);
                    done();
                });
        });

    });
});
