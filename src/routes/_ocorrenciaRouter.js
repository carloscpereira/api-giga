import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';

import ocorrenciaController from '../app/controllers/ocorrenciaController';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, ocorrenciaController.index);
routes.post('/:operator', operatorMiddleware, ocorrenciaController.store);
routes.put('/:operator/:id', operatorMiddleware, ocorrenciaController.update);

module.exports = routes;
