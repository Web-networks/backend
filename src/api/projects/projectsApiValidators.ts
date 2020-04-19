import { celebrate, Segments, Joi } from 'celebrate';
import { IProject } from 'types';

export const addPostValidator = celebrate({
    [Segments.BODY]: Joi.object<IProject>().keys({
        name: Joi.string().required(),
        description: Joi.string(),
        sharedWith: Joi.array(),
        isPublic: Joi.boolean(),
    }),
});
