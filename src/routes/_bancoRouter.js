import { Router } from 'express';

import BancoController from '../app/controllers/bancoController';

import { checkOperator } from '../app/middlewares';

const bancoRouter = new Router();

bancoRouter.get('/:operator/', checkOperator, BancoController.index);
bancoRouter.post('/:operator/', checkOperator, BancoController.create);
bancoRouter.get('/:operator/:id', checkOperator, BancoController.show);
bancoRouter.put('/:operator/:id', checkOperator, BancoController.update);
bancoRouter.delete('/:operator/:id', checkOperator, BancoController.destroy);

export default bancoRouter;
