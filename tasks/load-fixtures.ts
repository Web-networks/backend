// @ts-ignore
import Fixtures from 'node-mongodb-fixtures';
import config from 'config';

const fixtures = new Fixtures();

fixtures
    .connect(config.get('dbHost'))
    .then(() => fixtures.unload())
    .then(() => fixtures.load())
    .then(() => fixtures.disconnect());
