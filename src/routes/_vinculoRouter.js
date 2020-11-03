import { Router } from 'express';

import VinculoController from '../app/controllers/vinculoController';

import { checkOperator } from '../app/middlewares';

const vinculoRouter = Router();

vinculoRouter.get('/:operator/', checkOperator, VinculoController.index);
vinculoRouter.post('/:operator/', checkOperator, VinculoController.create);
vinculoRouter.get('/:operator/:id', checkOperator, VinculoController.show);
vinculoRouter.put('/:operator/:id', checkOperator, VinculoController.update);
vinculoRouter.delete('/:operator/:id', checkOperator, VinculoController.destroy);

export default vinculoRouter;
