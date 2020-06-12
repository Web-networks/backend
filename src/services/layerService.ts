import { pick } from 'lodash';
import { ILayer, ILayerPopulated, layerModel } from 'models/layerModel';
import { NeuroModelService } from 'services/neuroModelService';

export class LayerService {
    private static readonly layerFieldsInfo: Array<keyof ILayer> = [
        'id', 'params', 'type',
    ];

    public static async addLayer(layer: ILayer): Promise<ILayerPopulated[]> {
        const newLayer = await layerModel.create(layer);
        const { model: modelId } = layer;
        const { id: layerId } = newLayer;
        const nextLayers = await NeuroModelService.addLayerToModel(modelId, layerId);
        return this.getLayersInfoByIds(nextLayers);
    }

    public static async removeLayer(layerId: string): Promise<ILayerPopulated[]> {
        const layerToRemove = await layerModel.findById(layerId);
        if (!layerToRemove) {
            throw new Error('Layer not found');
        }
        const { model: modelId } = layerToRemove;
        const nextLayers = await NeuroModelService.removeLayerFromModel(modelId, layerId);
        return this.getLayersInfoByIds(nextLayers);
    }

    public static async editLayer(
        layerId: string,
        nextLayer: Partial<Omit<ILayer, 'id' | 'model'>>,
    ): Promise<ILayerPopulated[]> {
        const updatedLayer = await layerModel.findByIdAndUpdate(layerId, nextLayer, { new: true });
        if (!updatedLayer) {
            throw new Error('Layer not found');
        }
        const { model: modelId } = updatedLayer;
        const nextLayers = await NeuroModelService.getLayers(modelId);
        return this.getLayersInfoByIds(nextLayers);
    }

    public static async getLayers(modelId: string): Promise<ILayerPopulated[]> {
        const layersIds = await NeuroModelService.getLayers(modelId);
        return this.getLayersInfoByIds(layersIds);
    }

    private static async getLayerInfoById(layerId: string): Promise<ILayerPopulated> {
        const layer = await layerModel.findById(layerId);
        if (!layer) {
            throw new Error('Layer not found');
        }
        const populatedLayer = layer
            .populate('model') as ILayerPopulated;
        return pick(populatedLayer, this.layerFieldsInfo);
    }

    private static async getLayersInfoByIds(layers: string[]): Promise<ILayerPopulated[]> {
        return Promise.all(layers.map(id => this.getLayerInfoById(id)));
    }
}
