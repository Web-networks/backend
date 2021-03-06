import { celebrate, Segments, Joi } from 'celebrate';
import { INeuroModel } from 'models/neuroModel';

export const addPostValidator = celebrate({
    [Segments.BODY]: Joi.object<INeuroModel>().keys({
        project: Joi
            .string()
            .required()
            .messages({
                'any.required': 'Project id is required',
            }),
        loss: Joi.string(),
        optimizer: Joi.string(),
        metrics: Joi.string(),
    }),
});

export const editModelValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
        modelId: Joi
            .string()
            .required()
            .messages({
                'any.required': 'Model id is required',
            }),
        loss: Joi.string(),
        optimizer: Joi.string(),
        metrics: Joi.string(),
    }),
});

export const removeGetValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        modelId: Joi.string().required(),
    }),
});

export const getModelValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        project: Joi.string().required(),
    }),
});

export const learnModelValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
        input: Joi.object().keys({
            type: Joi.string().required(),
            dataset: Joi.string().required(),
            dimensions: Joi.array().required(),
            channels: Joi.number().required(),
        }),
        output: Joi.object().required(),
        modelId: Joi.string().required(),
    }),
});
