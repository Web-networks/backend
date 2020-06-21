import express, { NextFunction } from 'express';
import multer from 'multer';
import config from 'config';

import { needAuthorization } from 'middlewares/authorization';
import userService, { IUserEditInfo, IUserSignIn, IUserSignUp } from 'services/userService';
import { Aws } from 'services/aws';
import { signInValidator, signUpValidator } from './passportApiValidators';

const passportRoute = express.Router();

const upload = multer({ limits: { fieldSize: Number(config.get('aws.maxFileSize')) } });
const aws = new Aws();

export default passportRoute
    .post('/signin', signInValidator, signIn)
    .post('/signup', signUpValidator, signUp)
    .post('/set_avatar', needAuthorization, upload.single('avatar'), setAvatar)
    .post('/editinfo', needAuthorization, editInfo)
    .get('/current', needAuthorization, current)
    .get('/signout', needAuthorization, signOut);

async function signIn(req: express.Request, res: express.Response) {
    try {
        const userRecord = req.body as IUserSignIn;
        const userInfo = await userService.signIn(userRecord);
        req.session!.user = userInfo;
        return res.status(202).json(userInfo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

async function signUp(req: express.Request, res: express.Response) {
    try {
        const userRecord = req.body as IUserSignUp;
        const userInfo = await userService.signUp(userRecord);
        req.session!.user = userInfo;
        return res.status(201).json(userInfo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

async function setAvatar(req: express.Request, res: express.Response, next: NextFunction) {
    const { file } = req;
    // @ts-ignore
    const { username } = req.session!.user;
    let avatarUrl: string;
    try {
        if (file) {
            avatarUrl = await aws.uploadUserPhoto(file, username);
        } else {
            return res.status(400).json({ message: 'File was not provided' });
        }
    } catch (error) {
        next(error);
        return;
    }
    // @ts-ignore
    const { username } = req.session.user;
    const newUser = await userService.updateUserAvatar(username, avatarUrl);
    req.session!.user = newUser;
    return res.status(200).json({ ...newUser });
}

async function editInfo(req: express.Request, res: express.Response) {
    try {
        // @ts-ignore
        const { username } = req.session.user;
        const userRecord = req.body as IUserEditInfo;
        const userInfo = await userService.editInfo(username, userRecord);
        req.session!.user = userInfo;
        return res.status(202).json(userInfo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

function current(req: express.Request, res: express.Response) {
    const { user } = req.session!;
    return res.status(200).json(user);
}

function signOut(req: express.Request, res: express.Response) {
    delete req.session!.user;
    return res.status(200).end();
}
