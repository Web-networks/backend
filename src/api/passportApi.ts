import express from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import userService, { IUserSignIn, IUserSignUp } from '../services/userService';

const passportRoute = express.Router();

passportRoute
    .post('/signin', celebrate({
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().required(),
            password: Joi.string().required(),
        }),
    }),
    async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
        try {
            const userRecord = req.body as IUserSignIn;
            const userInfo = await userService.signIn(userRecord);
            return res.status(202).json(userInfo);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    })
    .post('/signup', celebrate({
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().required(),
            password: Joi.string().required(),
            name: Joi.string().required(),
        }),
    }),
    async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
        try {
            const userRecord = req.body as IUserSignUp;
            const userInfo = await userService.signUp(userRecord);
            return res.status(201).json(userInfo);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });

export default passportRoute;
