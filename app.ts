import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import log4js from 'log4js';
import config from 'config';

const logger = log4js.getLogger();
logger.level = 'debug';

const app = express();
mongoose.connect(config.get('dbHost'));
app.use(morgan('dev'));
app.listen(config.get('port'), () => {
    logger.info(`Server listening on http://localhost:${config.get('port')}`);
});

app.get('/', (req, res) => {
    res.end('Hello world!');
});
