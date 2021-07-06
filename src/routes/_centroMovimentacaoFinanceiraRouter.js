import { Router } from 'express';

import CentroMovimentacaoFinanceiraController from '../app/controllers/centroMovimentacaoFinanceiraController';

import { checkOperator } from '../app/middlewares';

const centroMovimentacaoFinanceiraRouter = new Router();

centroMovimentacaoFinanceiraRouter.get('/:operator/', checkOperator, CentroMovimentacaoFinanceiraController.index);

export default centroMovimentacaoFinanceiraRouter;
