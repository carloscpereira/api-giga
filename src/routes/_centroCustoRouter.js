import { Router } from 'express';

import CentroCustoController from '../app/controllers/centroCustoController';

import { checkOperator } from '../app/middlewares';

const centroCustoRouter = new Router();

centroCustoRouter.get('/:operator/', checkOperator, CentroCustoController.index);

export default centroCustoRouter;
