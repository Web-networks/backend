export interface IProject {
    owner: IUser;
    name: string;
    displayName: string;
    description: string;
    id: string;
    isPublic: boolean;
    sharedWith: IUser[];
    _id: string;
}

export interface IUser {
    _id: string;
    username: string;
    email: string;
    id: string;
    avatar: string | null;
    firstName: string | null;
    lastName: string | null;
    projects: IProject[];
    availableProjects: IProject[];
}
