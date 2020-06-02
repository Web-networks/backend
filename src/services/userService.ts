import { pick } from 'lodash';

import { userModel, IUser } from 'models/userModel';

export type IUserSignUp = Omit<IUser, 'id'>;
export type IUserInfo = Omit<IUser, 'password'>;
export type IMinUserInfo = Pick<IUser, 'id' | 'username' | 'avatar'>;
export type IUserSignIn = Omit<IUser, 'id' | 'username'> & {
    password: string;
};
export type IUserEditInfo = Pick<IUser, 'firstName' | 'lastName'>;

class UserService {
    public static userInfoFields: Array<keyof IUserInfo> = [
        'email',
        'id',
        'username',
        'avatar',
        'firstName',
        'lastName',
    ];

    public static userMinInfoFields: Array<keyof IMinUserInfo> = ['id', 'username', 'avatar'];

    public static async findByUsername(partOfUserName: string = '', limit: number = 100) {
        const searchingRegExp = new RegExp(`.*${partOfUserName}.*`);
        const usersDocuments = await userModel.find({ username: searchingRegExp }).limit(limit);
        return this.getMinUsersInfo(usersDocuments);
    }

    public static async signUp(userRecord: IUserSignUp) {
        const withSameUsername = await userModel.findOne({ username: userRecord.username });
        if (withSameUsername) {
            throw new Error('User with this username already exists');
        }
        const withSameEmail = await userModel.findOne({ email: userRecord.email });
        if (withSameEmail) {
            throw new Error('User with this email already exists');
        }
        const candidate = await userModel.create(userRecord);
        return pick(candidate, this.userInfoFields);
    }

    public static async signIn(userData: IUserSignIn) {
        const { email, password } = userData;
        const candidate = await userModel.findOne({ email });
        if (!candidate) {
            throw new Error('No such user');
        }
        const isValidPassword = await candidate.verifyPassword(password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        return pick(candidate, this.userInfoFields);
    }

    public static async editInfo(username: string, userRecord: IUserEditInfo) {
        const { firstName, lastName } = userRecord;
        const newUser = await userModel.findOneAndUpdate({ username }, { firstName, lastName }, { new: true });
        if (!newUser) {
            throw new Error(`No such user ${username}`);
        }
        return pick(newUser, this.userInfoFields);
    }

    public static async updateUserAvatar(username: string, avatar: string) {
        const newUser = await userModel.findOneAndUpdate({ username }, { avatar }, { new: true });
        if (!newUser) {
            throw new Error(`No such user ${username}`);
        }
        return pick(newUser, this.userInfoFields);
    }

    public static async addOwnProject(userId: string, projectId: string) {
        const user = await userModel.findById(userId);
        user?.projects.push(projectId);
        await user?.save();
        return user?.populate('projects').populate('availableProjects:');
    }

    public static async removeOwnProject(userId: string, projectId: string) {
        const user = await userModel.findById(userId);
        if (user?.projects) {
            user?.projects.remove(projectId);
            await user?.save();
        }
        return user?.populate('projects').populate('availableProjects');
    }

    public static async addAvailableProject(userId: string, projectId: string) {
        const user = await userModel.findById(userId);
        user?.availableProjects.push(projectId);
        await user?.save();
        return user?.populate('projects').populate('availableProjects');
    }

    public static async removeAvailableProject(userId: string, projectId: string) {
        const user = await userModel.findById(userId);
        if (user?.availableProjects) {
            user?.availableProjects.remove(projectId);
            await user?.save();
        }
        return user?.populate('projects').populate('availableProjects');
    }

    public static getMinUsersInfo<T extends IMinUserInfo>(users: T[]) {
        return users.map(user => this.getMinUserInfo(user));
    }

    public static getMinUserInfo<T extends IMinUserInfo>(user: T) {
        return pick(user, this.userMinInfoFields);
    }
}

export default UserService;
