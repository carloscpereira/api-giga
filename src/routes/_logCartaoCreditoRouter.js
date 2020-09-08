import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import logCartaoCreditoController from '../app/controllers/logCartaoCreditoController';

import validateStore from '../app/validators/LogCartaoCreditoStore';
import validateUpdate from '../app/validators/LogCartaoCreditoUpdate';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, logCartaoCreditoController.index);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  validateUpdate,
  logCartaoCreditoController.update
);
routes.get(
  '/:operator/:id',
  operatorMiddleware,
  logCartaoCreditoController.show
);
routes.post(
  '/:operator',
  operatorMiddleware,
  validateStore,
  logCartaoCreditoController.store
);
routes.delete('/:operator/:id', operatorMiddleware);
export default routes;
