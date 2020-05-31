import { celebrate, Segments, Joi } from 'celebrate';
import { IProject } from 'types';

export const addPostValidator = celebrate({
    [Segments.BODY]: Joi.object<IProject>().keys({
        name: Joi
            .string()
            .regex(/^\w+$/i)
            .required()
            .messages({
                'any.required': 'Name is required',
                'string.regex.base': 'Use only letters and numbers for name of project',
            }),
        displayName: Joi.string().required(),
        description: Joi.string(),
        sharedWith: Joi.array(),
        isPublic: Joi.boolean(),
    }),
});

export const infoGetValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        user: Joi.string().required(),
        project: Joi.string().required(),
    }),
});

export const editPostValidator = celebrate({
    [Segments.BODY]: Joi.object<IProject>().keys({
        name: Joi
            .string()
            .regex(/^\w+$/i)
            .messages({
                'string.regex.base': 'Use only letters and numbers for name of project',
            }),
        displayName: Joi.string(),
        description: Joi.string(),
        sharedWith: Joi.array(),
        isPublic: Joi.boolean(),
    }),
});
