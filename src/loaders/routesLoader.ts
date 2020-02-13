import { Application } from 'express';

import passportRoute from '../api/passportApi';

function routesLoader(app: Application) {
    app.use('/passport', passportRoute);
}

export default routesLoader;
