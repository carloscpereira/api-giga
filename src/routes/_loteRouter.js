import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import loteController from '../app/controllers/loteController';

import validateStore from '../app/validators/LoteStore';
import validateUpdate from '../app/validators/LoteUpdate';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, loteController.index);
routes.post(
  '/:operator',
  operatorMiddleware,
  validateStore,
  loteController.store
);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  validateUpdate,
  loteController.update
);
routes.get('/:operator/:id', operatorMiddleware, loteController.show);

module.exports = routes;
