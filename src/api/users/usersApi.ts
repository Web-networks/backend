import { Router } from 'express';
import userService from 'services/userService';

import { findQueryValidator } from './usersApiValidators';


const usersRoute = Router();

interface IFindQuery {
    username?: string,
    limit?: number,
}

usersRoute
    .get('/find', findQueryValidator,
        async (req, res) => {
            const { username, limit } = req.query as IFindQuery;
            const users = await userService.findByUsername(username, limit);
            return res.status(200).json({ users });
        });

export default usersRoute;
