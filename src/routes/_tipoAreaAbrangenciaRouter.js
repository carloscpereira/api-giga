import { Router } from 'express';

import TipoAreaAbrangencia from '../app/controllers/tipoAreaAbrangenciaController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, TipoAreaAbrangencia.index);
// agenciaRouter.post('/:operator/', checkOperator, TipoAreaAbrangencia.create);
agenciaRouter.get('/:operator/:id', checkOperator, TipoAreaAbrangencia.show);
// agenciaRouter.put('/:operator/:id', checkOperator, TipoAreaAbrangencia.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, TipoAreaAbrangencia.destroy);

export default agenciaRouter;
