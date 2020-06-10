import { omit } from 'lodash';
import { INeuroModel, neuroModel } from 'models/neuroModel';
import { ProjectsService } from 'services/projectsService';

export class NeuroModelService {
    public static async createModel(projectId: string, options?: Partial<INeuroModel>): Promise<INeuroModel> {
        const neuroModelOptions = omit(options, ['layers', 'project']);
        const neuroModelPrototype = {
            project: projectId,
            ...neuroModelOptions,
        };
        const neuroModelCreated = await neuroModel.create(neuroModelPrototype);
        await ProjectsService.addNeuroModel(projectId, neuroModelCreated.id);
        return neuroModelCreated;
    }

    public static async removeModel(modelId: string): Promise<void> {
        const modelToRemove = await neuroModel.findById(modelId);
        if (!modelToRemove) {
            throw new Error('Model not found to remove');
        }
        const projectId = modelToRemove.project;
        await ProjectsService.removeNeuroModel(projectId);
    }
}
