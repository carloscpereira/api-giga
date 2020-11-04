import { Router } from 'express';

import TipoContratacao from '../app/controllers/tipoContratacaoController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, TipoContratacao.index);
// agenciaRouter.post('/:operator/', checkOperator, TipoContratacao.create);
agenciaRouter.get('/:operator/:id', checkOperator, TipoContratacao.show);
// agenciaRouter.put('/:operator/:id', checkOperator, TipoContratacao.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, TipoContratacao.destroy);

export default agenciaRouter;
