import { Router } from 'express';

import DepartamentoController from '../app/controllers/departamentoController';

import { checkOperator } from '../app/middlewares';

const departamentoRouter = new Router();

departamentoRouter.get('/:operator/', checkOperator, DepartamentoController.index);
departamentoRouter.post('/:operator/', checkOperator, DepartamentoController.create);
departamentoRouter.get('/:operator/:id', checkOperator, DepartamentoController.show);
departamentoRouter.put('/:operator/:id', checkOperator, DepartamentoController.update);
departamentoRouter.delete('/:operator/:id', checkOperator, DepartamentoController.destroy);

export default departamentoRouter;
