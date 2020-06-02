import { Router, Request, Response } from 'express';
import { IUserInfo } from 'services/userService';
import { ProjectsService } from 'services/projectsService';
import { needAuthorization } from 'middlewares/authorization';
import { addPostValidator, infoGetValidator, editPostValidator } from './projectsApiValidators';
import { IProjectPopulated } from 'models/projectModel';

export const projectsRoute = Router();

projectsRoute
    .post('/add', needAuthorization, addPostValidator, addProject)
    .get('/my', needAuthorization, myProjects)
    .get('/info', infoGetValidator, getInfo)
    .post('/:id/edit', needAuthorization, editPostValidator, editProject);

type ProjectInfo = Partial<IProjectPopulated>;

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

async function editProject(req: Request, res: Response) {
    const { id: userId } = req.session?.user as IUserInfo;
    const projectParams = req.body as ProjectInfo;
    const projectId = req.params['id'];
    try {
        const nextProject = await ProjectsService.editProject(projectId, userId, { ...projectParams });
        res.status(201).json(nextProject);
    } catch (error) {
        console.error(error);
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


async function getInfo(req: Request, res: Response) {
    type QueryT = {user: string; project: string};
    const { user, project: projectName } = req.query as QueryT;
    let projectInfo;
    try {
        projectInfo = await ProjectsService.getProject(user, projectName);
    } catch (error) {
        res.status(400).json({ message: String(error) });
        return;
    }
    if (projectInfo.isPublic) {
        res.json(projectInfo);
        return;
    }
    if (!req.session?.user) {
        res.status(400).json({ message: 'Need authorization' });
        return;
    }
    const currentUserId = req.session.user.id;
    if (projectInfo.owner.id !== currentUserId && !projectInfo.sharedWith.find(({ id }) => id === currentUserId)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    res.json(projectInfo);
}
