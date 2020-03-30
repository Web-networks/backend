import express from 'express';
import userService, { IUserSignIn, IUserSignUp } from 'services/userService';

import { signInValidator, signUpValidator } from './passportApiValidators';

const passportRoute = express.Router();

passportRoute
    .post('/signin', signInValidator,
        async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
            try {
                const userRecord = req.body as IUserSignIn;
                const userInfo = await userService.signIn(userRecord);
                req.session!.user = userInfo;
                return res.status(202).json(userInfo);
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        })
    .post('/signup', signUpValidator,
        async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
            try {
                const userRecord = req.body as IUserSignUp;
                const userInfo = await userService.signUp(userRecord);
                return res.status(201).json(userInfo);
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        })
    .get('/current',
        async (req: express.Request, res: express.Response) => {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ message: 'unauthorized' });
            }
            const { user } = req.session;
            return res.status(200).json(user);
        });

export default passportRoute;
