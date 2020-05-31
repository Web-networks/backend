import mongoose from 'mongoose';
import { IProject } from 'types';

export interface IProjectModel extends Omit<IProject, 'sharedWith' | 'owner'> {
    owner: string;
    sharedWith: string[];
}

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
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],

    isPublic: {
        type: Boolean,
        default: false,
    },
});

export type ProjectDocument = IProjectModel & mongoose.Document;

export const projectModel = mongoose.model<ProjectDocument>('Project', ProjectSchema);
