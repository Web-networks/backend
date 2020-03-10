import {
    Application,
    Request,
    Response,
    NextFunction,
} from 'express';
import { errors } from 'celebrate';

function lastLoader(app: Application) {
    // errors from validation put objects
    app.use(errors());

    // error last handler middleware
    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
        process.stderr.write(err.toString());
        return res.status(500).json(err);
    });
}

export default lastLoader;
