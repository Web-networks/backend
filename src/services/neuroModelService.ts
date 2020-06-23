import { omit, pick } from 'lodash';
import axios from 'axios';
import config from 'config';

import { INeuroModel, neuroModel, INeuroModelPopulated } from 'models/neuroModel';
import { ProjectsService } from 'services/projectsService';

interface LearnModelOptions {
    input: {
        type: string;
        dataset: string;
    };
    output: Object;
}

export class NeuroModelService {
    private static readonly fieldsInfo: Array<keyof INeuroModel> = [
        'loss', 'optimizer', 'metrics', 'id', 'layers', 'project', 'task',
    ];

    public static async createModel(projectId: string, options?: Partial<INeuroModel>): Promise<INeuroModel> {
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
        const { layers } = modelToRemove;
        const projectId = modelToRemove.project;
        await Promise.all(layers.map(async layerId => this.removeLayerFromModel(modelId, layerId)));
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

    public static async editModel(
        modelId: string,
        options: Omit<Partial<INeuroModel>, 'layers'>,
    ): Promise<INeuroModel> {
        const nextModel = await neuroModel.findByIdAndUpdate(modelId, options, { new: true });
        if (!nextModel) {
            throw new Error('Model not found');
        }
        return this.getModelInfo(nextModel);
    }

    public static async getLayers(modelId: string): Promise<string[]> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        return model.layers.map(String);
    }

    public static async getModelInfoById(modelId: string): Promise<INeuroModel | null> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        return this.getModelInfo(model);
    }

    public static async getModelByProjectId(projectId: string): Promise<INeuroModel | null> {
        const model = await neuroModel.findOne({ project: projectId });
        if (!model) {
            return null;
        }
        return this.getModelInfo(model);
    }

    public static async learnModel(
        modelId: string,
        options: LearnModelOptions,
        userId: string,
    ): Promise<INeuroModel> {
        const model = await neuroModel.findById(modelId);
        if (!model) {
            throw new Error('Model not found');
        }
        const modelInfo = await this.getExtendedModelInfo(model);

        const minModelInfo = omit(modelInfo, ['id', 'project']);
        const creationModelInfo = {
            ...minModelInfo,
            ...options,
            layers: minModelInfo.layers?.map(({ type, params }) => ({ type, params })),
        };
        const metaBackendHost = config.get('metaBackendHost');
        const createModelUrl = `${metaBackendHost}/api/create-model`;
        const creationModelResponse = await axios
            .post(createModelUrl, creationModelInfo, {
                headers: {
                    'X-User-id': userId,
                },
            });
        const { model_id: createdModelId } = creationModelResponse.data;

        const startTrainTaskUrl = `${metaBackendHost}/api/start-train-task`;
        const trainTaskBody = {
            model_id: createdModelId,
            user_input_id: options.input.dataset,
            parameters: '',
        };
        const trainTaskResponse = await axios
            .post(startTrainTaskUrl, trainTaskBody, {
                headers: {
                    'X-User-id': userId,
                },
            });
        const { task_id: taskId } = trainTaskResponse.data;
        const updatedModel = await neuroModel.findByIdAndUpdate(modelId, { task: taskId }, { new: true });
        return this.getModelInfo(updatedModel!);
    }

    private static async getExtendedModelInfo(neuroModel: INeuroModel): Promise<Partial<INeuroModelPopulated>> {
        const neuroModelPopulated = await neuroModel
            .populate('layers')
            .populate('project')
            .execPopulate();
        return pick(neuroModelPopulated, this.fieldsInfo);
    }

    private static getModelInfo(neuroModel: INeuroModel): INeuroModel {
        return pick(neuroModel, this.fieldsInfo);
    }
}
