// @ts-ignore
require('module-alias/register');

/* eslint-disable import/first */
import express from 'express';
import mongoose from 'mongoose';
import config from 'config';


import routesLoader from 'loaders/routesLoader';
import basicLoader from 'loaders/basicLoader';
import lastLoader from 'loaders/lastLoader';

// Create express App
const app: express.Application = express();

// Connect to MongoDB
mongoose.connect(config.get('dbHost'), { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

// Connect middlewares to application
[
    // basic loaders
    basicLoader,

    // application loaders
    routesLoader,

    // very last loader
    lastLoader,
].forEach((loader) => loader(app));

// Connect to port for listening
app.listen(config.get('port'), () => {
    process.stdout.write('👂 Server listening on', '\x1b[33m', `http://localhost:${config.get('port')}`, '\x1b[0m');
});

// Only for test
app.get('/', (req, res) => {
    res.end('Hello world!');
});
