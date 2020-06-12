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
    }

    private static getModelInfo(neuroModel: INeuroModel): INeuroModelInfo {
        const neuroModelPopulated = neuroModel
            .populate('layers')
            .populate('project') as INeuroModelPopulated;
        return pick(neuroModelPopulated, this.fieldsInfo);
    }
}
