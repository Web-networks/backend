import { Application } from 'express';
import morgan from 'morgan';

function loggerLoader(app: Application) {
    app.use(morgan('dev'));
}

export default loggerLoader;
