import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';

import loteController from '../app/controllers/loteController';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, loteController.index);
routes.post('/:operator', operatorMiddleware, loteController.store);
routes.put('/:operator/:id', operatorMiddleware, loteController.update);

module.exports = routes;
