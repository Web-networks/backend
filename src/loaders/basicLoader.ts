import * as bodyParser from 'body-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import connect from 'connect-mongo';
import { Application } from 'express';
import config from 'config';
import morgan from 'morgan';

function basicLoader(app: Application) {
    // body parser json
    app.use(bodyParser.json());

    // logging requests
    app.use(morgan('dev'));

    // add session storage
    const MongoStore = connect(session);
    app.use(session({
        secret: config.get('sessionSecret'),
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false,
        saveUninitialized: false,
    }));
}

export default basicLoader;
