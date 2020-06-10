import { Router } from 'express';
import { addPostValidator, removeGetValidator } from './neuroModelsValidators';
import { needAuthorization } from 'middlewares/authorization';

export const neuroModelsRoute = Router();

neuroModelsRoute
    .post('add', needAuthorization, addPostValidator, addModel)
    .get('remove', needAuthorization, removeGetValidator, removeModel);

async function addModel() {
    // pass
}

async function removeModel() {
    // pass
}
