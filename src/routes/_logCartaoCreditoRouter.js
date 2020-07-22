import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';

import logCartaoCreditoController from '../app/controllers/logCartaoCreditoController';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, logCartaoCreditoController.index);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  logCartaoCreditoController.update
);
routes.get(
  '/:operator/:id',
  operatorMiddleware,
  logCartaoCreditoController.show
);
routes.post('/:operator', operatorMiddleware, logCartaoCreditoController.store);
routes.delete('/:operator/:id', operatorMiddleware);
module.exports = routes;
