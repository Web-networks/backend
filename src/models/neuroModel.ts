import mongoose, { Document, Types, Model } from 'mongoose';
import { ILayer } from 'models/layerModel';
import { IProject } from 'models/projectModel';

// https://github.com/Web-networks/CodeGen/blob/master/json-input-format.md
const NeuroModelSchema = new mongoose.Schema({
    loss: {
        type: String,
        required: true,
    },
    optimizer: {
        type: String,
    },
    metrics: {
        type: String,
    },
    layers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Layer',
        },
    ],
    project: {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
    },
    task: {
        type: String,
    },
});

interface INeuroModelShema extends Document {
    loss: string;
    optimizer?: string;
    metrics?: string;
    task?: string;
}

interface INeuroModelBase extends INeuroModelShema {
    // pass
}

export interface INeuroModel extends INeuroModelBase {
    layers: Types.Array<ILayer['_id']>;
    project: IProject['_id'];
}

export interface INeuroModelPopulated extends INeuroModelBase {
    layers: ILayer[];
    project: IProject;
}

export interface INeuroModelMongo extends Model<INeuroModel> {
    // pass
}

export const neuroModel = mongoose.model<INeuroModel>('NeuroModel', NeuroModelSchema);
