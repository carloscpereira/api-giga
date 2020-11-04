import { Router } from 'express';

import VersaoPlanoController from '../app/controllers/versaoPlanoController';

import { checkOperator } from '../app/middlewares';

const versaoPlanoRouter = new Router();

versaoPlanoRouter.get('/:operator/', checkOperator, VersaoPlanoController.index);
versaoPlanoRouter.post('/:operator/', checkOperator, VersaoPlanoController.create);
versaoPlanoRouter.get('/:operator/:id', checkOperator, VersaoPlanoController.show);
versaoPlanoRouter.put('/:operator/:id', checkOperator, VersaoPlanoController.update);
versaoPlanoRouter.delete('/:operator/:id', checkOperator, VersaoPlanoController.destroy);

export default versaoPlanoRouter;
