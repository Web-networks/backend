import { celebrate, Joi, Segments } from 'celebrate';

export const signInValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi
            .string()
            .required()
            .messages({
                'any.required': 'email is required',
            }),
        password: Joi
            .string()
            .required()
            .messages({
                'any.required': 'password is required',
            }),
    }),
});

export const signUpValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi
            .string()
            .required()
            .email()
            .messages({
                'any.required': 'email is required',
                'string.email': 'email has wrong format',
            }),
        password: Joi
            .string()
            .alphanum()
            .max(10)
            .min(5)
            .required()
            .messages({
                'any.required': 'password is required',
                'string.max': 'password must be not more then 10 symbols',
                'string.min': 'password must be not less then 5 symbols',
                'string.alphanum': 'password must contain only a-z, A-Z, 0-9',
            }),
        username: Joi
            .string()
            .required()
            .alphanum()
            .min(3)
            .messages({
                'any.required': 'username is required',
                'string.min': 'username must be not less then 3 symbols',
                'string.alphanum': 'username must contain only a-z, A-Z, 0-9',
            }),
    }),
});
