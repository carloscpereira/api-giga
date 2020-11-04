import { Router } from 'express';

import RegraVigencia from '../app/controllers/regraVigenciaContratoController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, RegraVigencia.index);
// agenciaRouter.post('/:operator/', checkOperator, RegraVigencia.create);
agenciaRouter.get('/:operator/:id', checkOperator, RegraVigencia.show);
// agenciaRouter.put('/:operator/:id', checkOperator, RegraVigencia.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, RegraVigencia.destroy);

export default agenciaRouter;
