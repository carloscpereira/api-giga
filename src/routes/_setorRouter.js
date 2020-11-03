import { Router } from 'express';

import SetorController from '../app/controllers/setorController';

import { checkOperator } from '../app/middlewares';

const setorRouter = Router();

setorRouter.get('/:operator/', checkOperator, SetorController.index);
setorRouter.post('/:operator/', checkOperator, SetorController.create);
setorRouter.get('/:operator/:id', checkOperator, SetorController.show);
setorRouter.put('/:operator/:id', checkOperator, SetorController.update);
setorRouter.delete('/:operator/:id', checkOperator, SetorController.destroy);

export default setorRouter;
