import { Router } from 'express';

import modalidadePagamentoController from '../app/controllers/modalidadePagamentoController';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import validateStore from '../app/validators/ModalidadePagamentoStore';
import validateUpdate from '../app/validators/ModalidadePagamentoUpdate';

const routes = new Router();

routes.get(
  '/:operator/',
  operatorMiddleware,
  modalidadePagamentoController.index
);
routes.get(
  '/:operator/:id',
  operatorMiddleware,
  modalidadePagamentoController.show
);
routes.put(
  '/:operator/:id',
  operatorMiddleware,
  validateStore,
  modalidadePagamentoController.update
);
routes.post(
  '/:operator',
  operatorMiddleware,
  validateUpdate,
  modalidadePagamentoController.store
);

export default routes;
