import { omit, pick } from 'lodash';
import { INeuroModel, neuroModel, INeuroModelPopulated } from 'models/neuroModel';
import { ProjectsService } from 'services/projectsService';

type INeuroModelInfo = Partial<INeuroModelPopulated>;

export class NeuroModelService {
    private static readonly fieldsInfo: Array<keyof INeuroModel> = [
        'loss', 'optimizer', 'metrics', 'id', 'layers', 'project',
    ];

    public static async createModel(projectId: string, options?: Partial<INeuroModel>): Promise<INeuroModelInfo> {
        const neuroModelOptions = omit(options, ['layers', 'project']);
        const neuroModelPrototype = {
            project: projectId,
            ...neuroModelOptions,
        };
        const neuroModelCreated = await neuroModel.create(neuroModelPrototype);
        await ProjectsService.addNeuroModel(projectId, neuroModelCreated.id);
        return this.getModelInfo(neuroModelCreated);
    }

    public static async removeModel(modelId: string): Promise<void> {
        const modelToRemove = await neuroModel.findById(modelId);
        if (!modelToRemove) {
            throw new Error('Model not found to remove');
        }
        const projectId = modelToRemove.project;
        await ProjectsService.removeNeuroModel(projectId);
        await neuroModel.findByIdAndRemove(modelId);
    }

    public static async addLayerToModel(modelId: string, layerId: string): Promise<string[]> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        model.layers.push(layerId);
        await model.save();
        return model.layers.map(String);
    }

    public static async removeLayerFromModel(modelId: string, layerId: string): Promise<string[]> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        model.layers.remove(layerId);
        await model.save();
        return model.layers.map(String);
    }

    public static async getLayers(modelId: string): Promise<string[]> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        return model.layers.map(String);
    }

    public static async getModelInfoById(modelId: string): Promise<INeuroModelInfo> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        return this.getModelInfo(model);
    }

    public static async getModelByProjectId(projectId: string): Promise<INeuroModelInfo> {
        const model = await neuroModel.findOne({ project: projectId });
        if (!model) {
            throw new Error('Model not found');
        }
        return this.getModelInfo(model);
    }

    private static getModelInfo(neuroModel: INeuroModel): INeuroModelInfo {
        const neuroModelPopulated = neuroModel
            .populate('layers')
            .populate('project') as INeuroModelPopulated;
        return pick(neuroModelPopulated, this.fieldsInfo);
    }
}
