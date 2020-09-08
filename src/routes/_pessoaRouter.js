import { Router } from 'express';
import { checkOperator as operatorMiddleware } from '../app/middlewares';

import pessoaController from '../app/controllers/pessoaController';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, pessoaController.index);

module.exports = routes;
