import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import tipoCarteiraController from '../app/controllers/tipoCarteiraController';

import validateStore from '../app/validators/TipoCarteiraStore';
import validateUpdate from '../app/validators/TipoCarteiraUpdate';

const routes = new Router();

routes.get('/:operator/', operatorMiddleware, tipoCarteiraController.index);
routes.get('/:operator/:id', operatorMiddleware, tipoCarteiraController.show);
routes.post(
  '/:operator',
  operatorMiddleware,
  validateStore,
  tipoCarteiraController.store
);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  validateUpdate,
  tipoCarteiraController.update
);

export default routes;
