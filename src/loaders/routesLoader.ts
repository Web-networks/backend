import { Application } from 'express';
import passportRoute from 'api/passportApi/passportApi';
import usersRoute from 'api/users/usersApi';

function routesLoader(app: Application) {
    app.use('/passport', passportRoute);
    app.use('/restapi/users', usersRoute);
}

export default routesLoader;
