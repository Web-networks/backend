import { Router, Request, Response } from 'express';
import { IUserInfo } from 'services/userService';
import { ProjectsService } from 'services/projectsService';
import { needAuthorization } from 'middlewares/authorization';
import { addPostValidator } from './projectsApiValidators';

export const projectsRoute = Router();

projectsRoute
    .post('/add', needAuthorization, addPostValidator, addProject)
    .get('/my', needAuthorization, myProjects);


async function addProject(req: Request, res: Response) {
    const owner = req.session?.user as IUserInfo;
    const projectParams = req.body;
    try {
        const nextProjects = await ProjectsService.saveProject({ ...projectParams, owner });
        res.status(201).json(nextProjects);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function myProjects(req: Request, res: Response) {
    const owner = req.session?.user as IUserInfo;
    try {
        const projects = await ProjectsService.getProjects(owner.id);
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}
