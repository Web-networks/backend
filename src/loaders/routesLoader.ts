import { Application } from 'express';
import passportRoute from 'api/passportApi/passportApi';
import usersRoute from 'api/users/usersApi';
import { projectsRoute } from 'api/projects/projectsApi';

function routesLoader(app: Application) {
    app.use('/passport', passportRoute);
    app.use('/restapi/users', usersRoute);
    app.use('/restapi/projects', projectsRoute);
}

export default routesLoader;
