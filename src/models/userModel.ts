import mongoose, { Types, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IProject } from 'models/projectModel';

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

interface IUserShema extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
}

UserShema.methods.verifyPassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

interface IUserBase extends IUserShema {
    verifyPassword(candidate: string): Promise<boolean>;
}

export interface IUser extends IUserBase {
    projects: Types.Array<IProject['_id']>;
    availableProjects: Types.Array<IProject['_id']>;
}

export interface IUserPopulated extends IUserBase {
    projects: IProject[];
    availableProjects: IProject[];
}

export interface IUserModel extends Model<IUser> {}

UserShema.pre<IUser>('save', async function save(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const sault = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(this.password, sault);
    this.password = hashPassword;
    next();
});

export const userModel = mongoose.model<IUser, IUserModel>('User', UserShema);
