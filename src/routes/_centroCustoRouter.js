import { Router } from 'express';

import CentroCustoController from '../app/controllers/centroCustoController';

import { checkOperator } from '../app/middlewares';

const centroCustoRouter = Router();

centroCustoRouter.get('/:operator/', checkOperator, CentroCustoController.index);

export default centroCustoRouter;
