import { pick, mergeWith } from 'lodash';
import { projectModel, IProject, IProjectPopulated } from 'models/projectModel';
import { userModel, IUserPopulated } from 'models/userModel';
import UserService, { IMinUserInfo } from './userService';


type MinProjectsInfo = {
    sharedWith: Array<IMinUserInfo>;
    owner: IMinUserInfo;
} & Omit<IProject, 'sharedWith' | 'owner'>;

export class ProjectsService {
    public static projectsInfoFields: Array<keyof IProject> = [
        'id', 'description', 'isPublic', 'name', 'owner', 'sharedWith', 'displayName',
    ];

    public static async saveProject(project: MinProjectsInfo) {
        if (await projectModel.exists({ name: project.name, owner: project.owner.id })) {
            throw Error(`The project: "${project.name}" already exists in your profile`);
        }
        const nextSharedWith = project.sharedWith?.map(({ id }) => id) || [];
        const nextProject = {
            ...project,
            sharedWith: nextSharedWith,
            owner: project.owner.id,
        };
        const newProject = await projectModel.create(nextProject);
        await Promise.all(newProject.sharedWith.map(async userId => {
            await UserService.addAvailableProject(userId, newProject.id);
        }));
        const user = await UserService.addOwnProject(nextProject.owner, newProject.id);
        if (!user) {
            throw new Error('No owner');
        }
        return this.getProjects(user.id);
    }

    public static async editProject(id: string, userId: string, project: Partial<IProjectPopulated>) {
        const currentProject = await projectModel.findById(id);
        if (!currentProject) {
            throw new Error('Project not found');
        }
        if (String(currentProject.owner) !== userId && !currentProject.sharedWith.includes(userId)) {
            throw new Error('You have not enough permissions to edit this project');
        }
        const nextProjectModel = mergeWith({}, project,
            {
                sharedWith: project?.sharedWith?.map(({ id }) => id),
                owner: project?.owner?.id,
            }, (objValue, srcValue) => {
                if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                    return srcValue;
                }
            });
        return this.updateProjectById(id, nextProjectModel);
    }

    public static async getProjects(userId: string) {
        const user = await userModel
            .findById(userId)
            .populate({
                path: 'availableProjects',
                populate: [{
                    path: 'sharedWith',
                }, {
                    path: 'owner',
                }],
            })
            .populate({
                path: 'projects',
                populate: [{
                    path: 'sharedWith',
                }, {
                    path: 'owner',
                }],
            }) as IUserPopulated;
        if (!user) {
            throw Error(`User with id: "${userId}" not found`);
        }
        const availableProjects = this.getMinProjectsInfo(user.availableProjects);
        const projects = this.getMinProjectsInfo(user.projects);
        return { availableProjects, projects };
    }

    public static getMinProjectInfo<T extends IProjectPopulated>(project: T) {
        const nextProject = pick(project, this.projectsInfoFields);
        const nextSharedWith = UserService.getMinUsersInfo(nextProject.sharedWith);
        const nextOwner = UserService.getMinUserInfo(nextProject.owner);
        return { ...nextProject, owner: nextOwner, sharedWith: nextSharedWith };
    }

    public static getMinProjectsInfo<T extends IProjectPopulated[]>(projects: T) {
        return projects.map(project => this.getMinProjectInfo(project));
    }

    public static async getProject(owner: string, projectName: string): Promise<MinProjectsInfo> {
        const userDoc = await userModel.findOne({ username: owner });
        if (!userDoc) {
            throw new Error(`User: ${owner} not found`);
        }
        const userId = userDoc._id;
        const projectDoc = await projectModel
            .findOne({ owner: userId, name: projectName })
            .populate('owner')
            .populate('sharedWith') as any;
        if (!projectDoc) {
            throw new Error(`Project: ${projectName} not found`);
        }
        return this.getMinProjectInfo(projectDoc);
    }

    public static async addNeuroModel(projectId: string, modelId: string): Promise<void> {
        const project = await projectModel.findById(projectId);
        if (!project) {
            throw new Error('Project not found to add model');
        }
        if (project.neuroModel) {
            throw new Error('Model already exists for this project');
        }
        project.neuroModel = modelId;
        await project.save();
    }

    public static async removeNeuroModel(projectId: string): Promise<void> {
        const project = await projectModel.findById(projectId);
        if (!project) {
            throw new Error('Project not found to remove model');
        }
        if (!project.neuroModel) {
            throw new Error('Not existing model to remove');
        }
        delete project.neuroModel;
        await project.save();
    }

    public static async checkRightsForProject(projectId: string, userId: string): Promise<void> {
        const project = await projectModel.findById(projectId);
        if (String(project?.owner) !== projectId || project?.sharedWith.includes(userId)) {
            throw new Error('Acess forbidden to this project');
        }
    }

    private static async updateProjectById(
        id: string,
        updateProjectParams: Partial<IProjectPopulated>,
    ): Promise<MinProjectsInfo> {
        const currentProjectDoc = await projectModel.findById(id);
        if (!currentProjectDoc) {
            throw new Error('Project not found');
        }
        const currentProject = pick(currentProjectDoc, this.projectsInfoFields);
        const nextProject = mergeWith({}, currentProject, updateProjectParams, (objValue, srcValue) => {
            if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                return srcValue.slice();
            }
        });
        await Promise.all(currentProject.sharedWith.map(async userId => {
            await UserService.removeAvailableProject(userId, id);
        }));
        await UserService.removeOwnProject(currentProject.owner, id);
        const projectWithTheSameName = await projectModel.countDocuments({
            owner: nextProject.owner,
            name: nextProject.name,
        });
        if (projectWithTheSameName > 1) {
            throw new Error(`Project with the same name: ${nextProject.name} already exists for owner`);
        }
        await Promise.all(nextProject.sharedWith.map(async userId => {
            await UserService.addAvailableProject(userId, id);
        }));
        await UserService.addOwnProject(nextProject.owner, id);
        const projectDoc = await projectModel
            .findByIdAndUpdate(id, nextProject, { new: true })
            .populate('owner')
            .populate('sharedWith') as any;
        if (!projectDoc) {
            throw new Error('Project was not updated');
        }
        return this.getMinProjectInfo(projectDoc);
    }

}
