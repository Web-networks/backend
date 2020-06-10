import mongoose, { Document, Types, Model } from 'mongoose';
import { IUser } from 'models/userModel';
import { INeuroModel } from 'models/neuroModel';

const ProjectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Project must has an owner'],
        ref: 'User',
    },

    name: {
        type: String,
        maxlength: [30, 'Max length of name is 30 symbols'],
        required: true,
    },

    displayName: {
        type: String,
        maxlength: [30, 'Max length of displayName is 30 symbols'],
        required: true,
    },

    description: {
        type: String,
        maxlength: [120, 'Max length of description is 120 symbols'],
    },

    sharedWith: [
        {
            type: Types.ObjectId,
            ref: 'User',
        },
    ],

    isPublic: {
        type: Boolean,
        default: false,
    },

    neuroModel: {
        type: Types.ObjectId,
        ref: 'NeuroModel',
    },
});


// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
interface IProjectShema extends Document {
    name: string;
    displayName: string;
    description?: string;
    isPublic: boolean;
}

interface IProjectBase extends IProjectShema { /* virtual fields + methods for doc here */ }

export interface IProject extends IProjectBase {
    owner: IUser['_id'];
    sharedWith: Types.Array<IUser['_id']>;
    neuroModel?: INeuroModel['_id'];
}

export interface IProjectPopulated extends IProjectBase {
    owner: IUser;
    sharedWith: IUser[];
    neuroModel?: INeuroModel;
}

export interface IProjectModel extends Model<IProject> { /* some static methods here */ }

export const projectModel = mongoose.model<IProject>('Project', ProjectSchema);
