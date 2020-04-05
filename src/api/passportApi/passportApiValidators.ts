/* eslint-disable @typescript-eslint/no-magic-numbers */
import { celebrate, Joi, Segments } from 'celebrate';

export const signInValidator = celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi
            .string()
            .required()
            .email()
            .messages({
                'any.required': 'Email is required',
                'string.email': 'Invalid email',
            }),
        password: Joi
            .string()
            .required()
            .messages({
                'any.required': 'Password is required',
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
                'any.required': 'Email is required',
                'string.email': 'Invalid email',
            }),
        password: Joi
            .string()
            .alphanum()
            .max(10)
            .min(5)
            .required()
            .messages({
                'any.required': 'Password is required',
                'string.max': 'Password must be not more then 10 symbols',
                'string.min': 'Password must be not less then 5 symbols',
                'string.alphanum': 'Password must contain only a-z, A-Z, 0-9',
            }),
        username: Joi
            .string()
            .required()
            .alphanum()
            .min(3)
            .messages({
                'any.required': 'Username is required',
                'string.min': 'Username must be not less then 3 symbols',
                'string.alphanum': 'Username must contain only a-z, A-Z, 0-9',
            }),
    }),
});
