import { Router } from 'express';

import GrupoCentroMovimentacaoFinanceiraController from '../app/controllers/grupoCentroMovimentacaoFinanceiraController';

import { checkOperator } from '../app/middlewares';

const grupoCentroMovimentacaoFinanceiraRouter = new Router();

grupoCentroMovimentacaoFinanceiraRouter.get(
  '/:operator/',
  checkOperator,
  GrupoCentroMovimentacaoFinanceiraController.index
);

export default grupoCentroMovimentacaoFinanceiraRouter;
