import { celebrate, Joi, Segments } from 'celebrate';

export const findQueryValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        username: Joi.string(),
        limit: Joi.number(),
    }),
});
