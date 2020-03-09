import { pick } from 'lodash';
import userModel from '../models/userModel';

interface IUser {
    name: string;
    email: string;
    password: string;
    id: string;
}

export type IUserSignUp = IUser;
export type IUserInfo = Omit<IUser, 'password'>;
export type IUserSignIn = Omit<IUser, 'id' | 'name'>;

class UserService {
    public static async signUp(userRecord: IUserSignUp): Promise<IUserInfo> {
        const candidate = await userModel.create(userRecord) as IUserInfo;
        return pick(candidate, ['name', 'email', 'id']);
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
        return { name: candidate.name, email: candidate.email, id: candidate.id };
    }
}

export default UserService;
