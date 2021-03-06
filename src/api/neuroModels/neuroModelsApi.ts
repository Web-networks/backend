import { Router, Request, Response } from 'express';
import {
    addPostValidator,
    removeGetValidator,
    getModelValidator,
    editModelValidator,
    learnModelValidator,
} from './neuroModelsValidators';
import { needAuthorization } from 'middlewares/authorization';
import { IUser } from 'models/userModel';
import { ProjectsService } from 'services/projectsService';
import { NeuroModelService } from 'services/neuroModelService';

export const neuroModelsRoute = Router();

neuroModelsRoute
    .post('/create', needAuthorization, addPostValidator, addModel)
    .post('/edit', needAuthorization, editModelValidator, editModel)
    .get('/remove', needAuthorization, removeGetValidator, removeModel)
    .get('/get', needAuthorization, getModelValidator, getModelByProjectId)
    .get('/:id/info', needAuthorization, getModelInfo)
    .post('/learn', needAuthorization, learnModelValidator, learnModel);


async function addModel(req: Request, res: Response) {
    const { project, ...options } = req.body;
    const { id: userId } = req.session!.user as IUser;
    try {
        await ProjectsService.checkRightsForProject(project, userId);
        const model = await NeuroModelService.createModel(project, options);
        res.status(201).json(model);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function removeModel(req: Request, res: Response) {
    const { modelId } = req.query;
    try {
        await NeuroModelService.removeModel(modelId);
        res.status(200).json(null);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function getModelInfo(req: Request, res: Response) {
    const modelId = req.params['id'];
    try {
        const modelInfo = await NeuroModelService.getModelInfoById(modelId);
        res.status(200).json(modelInfo);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function getModelByProjectId(req: Request, res: Response) {
    const { project: projectId } = req.query;
    try {
        const modelInfo = await NeuroModelService.getModelByProjectId(projectId);
        res.status(200).json(modelInfo);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function editModel(req: Request, res: Response) {
    const { modelId, ...options } = req.body;
    try {
        const modelInfo = await NeuroModelService.editModel(modelId, options);
        res.status(200).json(modelInfo);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function learnModel(req: Request, res: Response) {
    const { modelId, ...options } = req.body;
    const { id: userId } = req.session!.user!;
    try {
        const modelInfo = await NeuroModelService.learnModel(modelId, options, userId);
        res.status(200).json(modelInfo);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.toString() });
    }
}
