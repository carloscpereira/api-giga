import { Router } from 'express';

import AreaCobertura from '../app/controllers/areaCoberturaController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, AreaCobertura.index);
// agenciaRouter.post('/:operator/', checkOperator, AreaCobertura.create);
agenciaRouter.get('/:operator/:id', checkOperator, AreaCobertura.show);
// agenciaRouter.put('/:operator/:id', checkOperator, AreaCobertura.update);
// agenciaRouter.delete('/:operator/:id', checkOperator, AreaCobertura.destroy);

export default agenciaRouter;
