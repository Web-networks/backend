import { Router, Request, Response } from 'express';
import { needAuthorization } from 'middlewares/authorization';
import {
    addPostValidator,
    removeGetValidator,
    editPostValidator,
    getLayersValidator,
} from './layersApiValidators';
import { LayerService } from 'services/layerService';

export const layersRouter = Router();

layersRouter
    .post('/add', needAuthorization, addPostValidator, addLayer)
    .get('/remove', needAuthorization, removeGetValidator, removeLayer)
    .post('/edit', needAuthorization, editPostValidator, editLayer)
    .get('/get', needAuthorization, getLayersValidator, getLayers)
    .get('/:id/info', needAuthorization, getLayerInfo);

async function addLayer(req: Request, res: Response) {
    const layer = req.body;
    try {
        const nextLayers = await LayerService.addLayer(layer);
        res.status(201).json(nextLayers);
    } catch (error) {
        res.status(400).json({ message: error.roString() });
    }
}

async function removeLayer(req: Request, res: Response) {
    const { id: layerId } = req.query;
    try {
        const nextLayers = await LayerService.removeLayer(layerId);
        res.status(200).json(nextLayers);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function editLayer(req: Request, res: Response) {
    const { id: layerId, ...updatedOptions } = req.body;
    try {
        const nextLayers = await LayerService.editLayer(layerId, updatedOptions);
        res.status(200).json(nextLayers);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function getLayerInfo(req: Request, res: Response) {
    const layerId = req.params['id'];
    try {
        const layerInfo = await LayerService.getLayerInfoById(layerId);
        res.status(200).json(layerInfo);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}

async function getLayers(req: Request, res: Response) {
    const { model: modelId } = req.query;
    try {
        const layers = await LayerService.getLayers(modelId);
        res.status(200).json(layers);
    } catch (error) {
        res.status(400).json({ message: error.toString() });
    }
}
