import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import ocorrenciaController from '../app/controllers/ocorrenciaController';

import validateStore from '../app/validators/OcorrenciaStore';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, ocorrenciaController.index);
routes.post(
  '/:operator',
  operatorMiddleware,
  validateStore,
  ocorrenciaController.store
);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  validateStore,
  ocorrenciaController.update
);

module.exports = routes;
