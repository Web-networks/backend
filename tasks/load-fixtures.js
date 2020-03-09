const Fixtures = require('node-mongodb-fixtures');
const config = require('config');

const fixtures = new Fixtures();

fixtures
    .connect(config.get('dbHost'))
    .then(() => fixtures.unload())
    .then(() => fixtures.load())
    .then(() => fixtures.disconnect());
