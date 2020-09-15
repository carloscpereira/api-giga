import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import logContatoController from '../app/controllers/logContatoController';

import validateStore from '../app/validators/LogContatoStore';
import validateUpdate from '../app/validators/LogContatoUpdate';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, logContatoController.index);
routes.put('/:operator/:id', operatorMiddleware, validateUpdate, logContatoController.update);
routes.get('/:operator/:id', operatorMiddleware, logContatoController.show);
routes.post('/:operator', operatorMiddleware, validateStore, logContatoController.store);
routes.delete('/:operator/:id', operatorMiddleware);
export default routes;
