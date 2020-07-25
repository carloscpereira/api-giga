import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import loteController from '../app/controllers/loteController';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, loteController.index);
routes.post('/:operator', operatorMiddleware, loteController.store);
routes.put('/:operator/:id', operatorMiddleware, loteController.update);
routes.get('/:operator/:id', operatorMiddleware, loteController.show);

module.exports = routes;
