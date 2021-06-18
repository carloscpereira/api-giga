import { Router } from 'express';

import TipoCartao from '../app/controllers/tipoCartaoController';

import { checkOperator } from '../app/middlewares';

const tipoCartaoRouter = new Router();

tipoCartaoRouter.get('/:operator/', checkOperator, TipoCartao.index);
tipoCartaoRouter.get('/:operator/:id', checkOperator, TipoCartao.show);

export default tipoCartaoRouter;
