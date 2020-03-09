import express from 'express';
import mongoose from 'mongoose';
import log4js from 'log4js';
import config from 'config';

import routesLoader from './loaders/routesLoader';
import loggerLoader from './loaders/loggerLoader';
import basicLoader from './loaders/basicLoader';
import lastLoader from './loaders/lastLoader';

const logger = log4js.getLogger();
logger.level = 'debug';

// Create express App
const app: express.Application = express();

// Connect to MongoDB
mongoose.connect(config.get('dbHost'), { useNewUrlParser: true, useUnifiedTopology: true });

// Connect middlewares to application
[
    // basic loaders
    basicLoader,
    loggerLoader,

    // application loaders
    routesLoader,

    // very last loader
    lastLoader,
].forEach((loader) => loader(app));

// Connect to port for listening
app.listen(config.get('port'), () => {
    logger.info(`Server listening on http://localhost:${config.get('port')}`);
});

// Only for test
app.get('/', (req, res) => {
    res.end('Hello world!');
});
