import { Router } from 'express';

import Agencia from '../app/controllers/agenciaController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, Agencia.index);
// agenciaRouter.post('/:operator/', checkOperator, Agencia.create);
agenciaRouter.get('/:operator/:id', checkOperator, Agencia.show);
// agenciaRouter.put('/:operator/:id', checkOperator, Agencia.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, Agencia.destroy);

export default agenciaRouter;
