import { Router } from 'express';

import ParticipacaoFinanceira from '../app/controllers/participacaoFinanceiraController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = Router();

agenciaRouter.get('/:operator/', checkOperator, ParticipacaoFinanceira.index);
// agenciaRouter.post('/:operator/', checkOperator, ParticipacaoFinanceira.create);
agenciaRouter.get('/:operator/:id', checkOperator, ParticipacaoFinanceira.show);
// agenciaRouter.put('/:operator/:id', checkOperator, ParticipacaoFinanceira.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, ParticipacaoFinanceira.destroy);

export default agenciaRouter;
