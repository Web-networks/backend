import mongoose, { Document, Model } from 'mongoose';
import { INeuroModel } from 'models/neuroModel';

const LayerShema = new mongoose.Schema({
    model: {
        type: mongoose.Types.ObjectId,
        ref: 'NeuroModel',
    },
    type: {
        type: String,
        required: true,
    },
    params: {
        type: Object,
        required: true,
        default: {},
    },
});

interface ILayerShema extends Document {
    type: string;
    params: Record<string, any>;
}

interface ILayerBase extends ILayerShema {
    // pass
}

export interface ILayer extends ILayerBase {
    model: INeuroModel['_id'];
}

export interface ILayerPopulated extends ILayer {
    model: INeuroModel;
}

export interface ILayerModel extends Model<ILayer> {
    // pass
}

export const layerModel = mongoose.model<ILayer>('Layer', LayerShema);
