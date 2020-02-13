import * as bodyParser from 'body-parser';
import express, {
    Application,
    Request,
    Response,
    NextFunction,
} from 'express';

function basicLoader(app: Application) {
    // body parser json
    app.use(bodyParser.json());
}

export default basicLoader;
