import { pick } from 'lodash';
import { IUser } from 'types';

import userModel, { UserDocument } from 'models/userModel';

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

    public static async findByUsername(partOfUserName: string = '', limit: number = 100): Promise<IMinUserInfo[]> {
        const searchingRegExp = new RegExp(`.*${partOfUserName}.*`);
        const usersDocuments = await userModel.find({ username: searchingRegExp }).limit(limit);
        return this.getMinUsersInfo(usersDocuments);
    }

    public static async signUp(userRecord: IUserSignUp): Promise<IUserInfo> {
        const withSameUsername = await userModel.findOne({ username: userRecord.username });
        if (withSameUsername) {
            throw new Error('User with this username already exists');
        }
        const withSameEmail = await userModel.findOne({ email: userRecord.email });
        if (withSameEmail) {
            throw new Error('User with this email already exists');
        }
        const candidate = await userModel.create(userRecord) as IUserInfo;
        return pick(candidate, this.userInfoFields);
    }

    public static async signIn(userData: IUserSignIn): Promise<IUserInfo> {
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

    public static async editInfo(username: string, userRecord: IUserEditInfo): Promise<IUserInfo> {
        const { firstName, lastName } = userRecord;
        const newUser = await userModel.findOneAndUpdate({ username }, { firstName, lastName }, { new: true });
        if (!newUser) {
            throw new Error(`No such user ${username}`);
        }
        return pick(newUser, this.userInfoFields);
    }

    public static async updateUserAvatar(username: string, avatar: string): Promise<IUserInfo> {
        const newUser = await userModel.findOneAndUpdate(username, { avatar }, { new: true });
        if (!newUser) {
            throw new Error(`No such user ${username}`);
        }
        return pick(newUser, this.userInfoFields);
    }

    public static getMinUsersInfo<T extends IUser>(users: T[]) {
        return users.map((user: UserDocument | IUser) => this.getMinUserInfo(user));
    }

    public static getMinUserInfo<T extends IUser>(user: T) {
        return pick(user, this.userMinInfoFields);
    }
}

export default UserService;
