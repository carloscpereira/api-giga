import { Router } from 'express';

import AgenciaController from '../app/controllers/agenciaController';

import { checkOperator } from '../app/middlewares';

const agenciaRouter = new Router();

agenciaRouter.get('/:operator/', checkOperator, AgenciaController.index);
agenciaRouter.post('/:operator/', checkOperator, AgenciaController.create);
agenciaRouter.get('/:operator/:id', checkOperator, AgenciaController.show);
agenciaRouter.put('/:operator/:id', checkOperator, AgenciaController.update);
agenciaRouter.delete('/:operator/:id', checkOperator, AgenciaController.destroy);

export default agenciaRouter;
