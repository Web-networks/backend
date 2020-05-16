import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from 'types';

interface IUserModel extends IUser {
    verifyPassword: (candidate: string) => Promise<boolean>;
    password: string;
}

const UserShema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Enter the name'],
        unique: [true, 'This username already exists'],
    },

    email: {
        type: String,
        lowercase: true,
        unique: [true, 'User with this email already exists'],
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
    },

    avatar: {
        type: String,
        default: null,
    },

    firstName: {
        type: String,
        default: null,
    },

    lastName: {
        type: String,
        default: null,
    },

    projects: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Project',
            default: [],
        },
    ],

    availableProjects: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Project',
            default: [],
        },
    ],
});

export type UserDocument = IUserModel & mongoose.Document;

UserShema.pre('save', async function save(next) {
    const user = this as UserDocument;
    if (!user.isModified('password')) {
        return next();
    }
    const sault = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(user.password, sault);
    user.password = hashPassword;
    next();
});

UserShema.methods.verifyPassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

export const userModel = mongoose.model<UserDocument>('User', UserShema);
export default userModel;
