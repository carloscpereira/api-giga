import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import boletoController from '../app/controllers/boletoController';

const routes = new Router();

routes.delete('/:operator/:id/boleto', operatorMiddleware, boletoController.destroy);

export default routes;
