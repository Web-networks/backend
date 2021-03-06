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

describe('PROJECT API', () => {
    before(() => {
        sh.exec('yarn ts-node ./tasks/load-fixtures.ts', { silent: true });
    });

    describe('GET /restapi/projects/my', () => {
        it('it should not get projects when unauthorised', done => {
            chai.request(backendHost)
                .get('/restapi/projects/my')
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(401);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });

        it('it should successfully get projects', done => {
            const chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end(() => {
                    chaiReq
                        .get('/restapi/projects/my')
                        .end((err, res) => {
                            expect(res, makeContext(res)).to.have.status(200);
                            expect(res.body).to.have.all.keys(['availableProjects', 'projects']);
                            done();
                        });
                });
        });
    });

    describe('POST /restapi/projects/add', () => {
        it('it should not add project when unauthorized', done => {
            chai.request(backendHost)
                .post('/restapi/projects/add')
                .send({ name: 'newProject' })
                .end((err, res) => {
                    expect(res, makeContext(res)).to.have.status(401);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });

        it('it should successfully add project', done => {
            const chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end(() => {
                    chaiReq
                        .post('/restapi/projects/add')
                        .send({ name: 'project_name', displayName: 'ProjectName' })
                        .end((err, res) => {
                            expect(res, makeContext(res)).to.have.status(201);
                            expect(res.body).to.have.all.keys(['availableProjects', 'projects']);
                            done();
                        });
                });
        });

        it('it should not add project with existing name', done => {
            const chaiReq = chai.request.agent(backendHost);
            chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' })
                .end(() => {
                    chaiReq
                        .post('/restapi/projects/add')
                        .send({ name: 'ProjectName' })
                        .end(() => {
                            chaiReq
                                .post('/restapi/projects/add')
                                .send({ name: 'ProjectName' })
                                .end((err, res) => {
                                    expect(res, makeContext(res)).to.have.status(400);
                                    expect(res.body).to.have.property('message');
                                    done();
                                });
                        });
                });
        });

        it('it should add project to user shared with', async () => {
            const chaiReq = chai.request.agent(backendHost);
            const signInRes = await chaiReq
                .post('/passport/signin')
                .send({ email: 'user4@mail.ru', password: 'user4' });
            expect(signInRes, makeContext(signInRes)).to.have.status(202);
            const { id: userId } = signInRes.body;
            await chaiReq.get('/passport/signout');
            await chaiReq
                .post('/passport/signin')
                .send({ email: 'user1@mail.ru', password: 'user1' });
            const res = await chaiReq
                .post('/restapi/projects/add')
                .send({
                    name: 'project1',
                    displayName: 'project1',
                    sharedWith: [{ id: userId, username: 'user4', avatar: null }],
                });
            expect(res, makeContext(res)).to.have.status(201);
            await chaiReq
                .post('/passport/signin')
                .send({ email: 'user4@mail.ru', password: 'user4' });
            const projectRes = await chaiReq.get('/restapi/projects/my');
            const { availableProjects } = projectRes.body;
            expect(availableProjects).to.have.length(1);
        });
    });
});
