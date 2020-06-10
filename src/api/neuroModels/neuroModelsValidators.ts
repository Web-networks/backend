import { celebrate, Segments, Joi } from 'celebrate';
import { INeuroModelPopulated } from 'models/neuroModel';

export const addPostValidator = celebrate({
    [Segments.BODY]: Joi.object<INeuroModelPopulated>().keys({
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

export const removeGetValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        modelId: Joi.string().required(),
    }),
});
