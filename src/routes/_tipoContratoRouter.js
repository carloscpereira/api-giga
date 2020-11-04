import { Router } from 'express';

import TipoContrato from '../app/controllers/tipoContratoController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, TipoContrato.index);
// agenciaRouter.post('/:operator/', checkOperator, TipoContrato.create);
agenciaRouter.get('/:operator/:id', checkOperator, TipoContrato.show);
// agenciaRouter.put('/:operator/:id', checkOperator, TipoContrato.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, TipoContrato.destroy);

export default agenciaRouter;
