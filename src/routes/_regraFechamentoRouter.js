import { Router } from 'express';

import RegraFechamento from '../app/controllers/regraFechamentoController';

import { checkOperator } from '../app/middlewares';

const regraFechamentoRouter = new Router();

regraFechamentoRouter.get('/:operator/', checkOperator, RegraFechamento.index);
// regraFechamentoRouter.post('/:operator/', checkOperator, RegraFechamento.create);
regraFechamentoRouter.get('/:operator/:id', checkOperator, RegraFechamento.show);
// regraFechamentoRouter.put('/:operator/:id', checkOperator, RegraFechamento.update);
// regraFechamentoRouter.delete('/:operator/:id', checkOperator, RegraFechamento.destroy);

export default regraFechamentoRouter;
