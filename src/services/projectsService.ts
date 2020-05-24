import { pick } from 'lodash';
import { projectModel } from 'models/projectModel';
import { userModel } from 'models/userModel';
import { IProject, IUser } from 'types';
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
            const user = await userModel.findById(userId);
            const _ = user?.availableProjects.push(newProject._id);
            return user?.save();
        }));
        const ownerUser = await userModel.findById(newProject.owner);
        const _ = ownerUser?.projects.push(newProject._id);
        await ownerUser?.save();
        return this.getProjects(ownerUser?._id);
    }

    public static async editProject(project: MinProjectsInfo, oldName: string) {
        if (project.name !== oldName) {
            if (await projectModel.exists({ name: project.name, owner: project.owner.id })) {
                throw Error(`The project "${project.name}" already exists in your profile`);
            }
        }
        const oldProject = await projectModel.findOne({ owner: project.owner.id, name: oldName });
        if (!oldProject) {
            throw Error(`No project with name "${oldName}" for user ${project.owner.id}`);
        }
        const nextSharedWith = await this.getSharedUsers(project.sharedWith.map(({ id }) => id));
        oldProject.description = project.description;
        oldProject.displayName = project.displayName;
        oldProject.name = project.name;
        oldProject.isPublic = project.isPublic;
        oldProject.sharedWith = nextSharedWith;
        await oldProject?.save();
        return this.getProject(project.owner.username, oldProject.name);
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
            });
        if (!user) {
            throw Error(`User with id: "${userId}" not found`);
        }
        const availableProjects = this.getMinProjectsInfo(user.availableProjects);
        const projects = this.getMinProjectsInfo(user.projects);
        return { availableProjects, projects };
    }

    public static getMinProjectInfo<T extends IProject>(project: T): MinProjectsInfo {
        const nextProject = pick(project, this.projectsInfoFields);
        const nextSharedWith = UserService.getMinUsersInfo(nextProject.sharedWith);
        const nextOwner = UserService.getMinUserInfo(nextProject.owner);
        return { ...nextProject, owner: nextOwner, sharedWith: nextSharedWith };
    }

    public static getMinProjectsInfo<T extends IProject[]>(projects: T): MinProjectsInfo[] {
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
            .populate('sharedWith');
        if (!projectDoc) {
            throw new Error(`Project: ${projectName} not found`);
        }
        return this.getMinProjectInfo(projectDoc);
    }

    private static async getSharedUsers(sharedWith: string[]) {
        const nextSharedWith: IUser[] = [];
        for (const id of sharedWith) {
            const user = await userModel.findById(id);
            if (!user) {
                throw new Error(`User with ${id} not found`);
            }
            nextSharedWith.push(user);
        }
        return nextSharedWith;
    }

}
