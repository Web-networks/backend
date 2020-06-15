import { celebrate, Segments, Joi } from 'celebrate';
import { ILayer } from 'models/layerModel';

export const addPostValidator = celebrate({
    [Segments.BODY]: Joi.object<ILayer>().keys({
        model: Joi
            .string()
            .required(),
        type: Joi
            .string()
            .required(),
        params: Joi
            .object()
            .required(),
    }),
});

export const editPostValidator = celebrate({
    [Segments.BODY]: Joi.object<ILayer>().keys({
        id: Joi
            .string()
            .required(),
        type: Joi
            .string(),
        params: Joi
            .object(),
    }),
});

export const removeGetValidator = celebrate({
    [Segments.QUERY]: Joi.object<ILayer>().keys({
        id: Joi
            .string()
            .required(),
    }),
});

export const getLayersValidator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        model: Joi.string().required(),
    }),
});
