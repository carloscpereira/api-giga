import { Router } from 'express';

import PlanoController from '../app/controllers/planoController';

import { checkOperator } from '../app/middlewares';

const planoRouter = new Router();

planoRouter.get('/:operator/', checkOperator, PlanoController.index);
planoRouter.post('/:operator/', checkOperator, PlanoController.create);
planoRouter.get('/:operator/:id', checkOperator, PlanoController.show);
planoRouter.put('/:operator/:id', checkOperator, PlanoController.update);
planoRouter.delete('/:operator/:id', checkOperator, PlanoController.destroy);

export default planoRouter;
