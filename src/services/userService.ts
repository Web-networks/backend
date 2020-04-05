import { pick } from 'lodash';

import userModel from 'models/userModel';

interface IUser {
    username: string;
    email: string;
    password: string;
    id: string;
}

export type IUserSignUp = Omit<IUser, 'id'>;
export type IUserInfo = Omit<IUser, 'password'>;
export type IMinUserInfo = Pick<IUser, 'id' | 'username'>;
export type IUserSignIn = Omit<IUser, 'id' | 'username'>;

class UserService {
    public static userInfoFields: Array<keyof IUserInfo> = ['email', 'id', 'username'];

    public static userMinInfoFields: Array<keyof IMinUserInfo> = ['id', 'username'];

    public static async findByUsername(partOfUserName: string = '', limit: number = 100): Promise<IMinUserInfo[]> {
        const searchingRegExp = new RegExp(`.*${partOfUserName}.*`);
        const usersDocuments = await userModel.find({ username: searchingRegExp }).limit(limit);
        return usersDocuments.map(user => pick(user, this.userMinInfoFields));
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
}

export default UserService;
