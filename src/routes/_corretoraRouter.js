import { Router } from 'express';

import Corretora from '../app/controllers/corretoraController';

import { checkOperator } from '../app/middlewares';

const corretoraRouter = new Router();

corretoraRouter.get('/:operator/', checkOperator, Corretora.index);
// corretoraRouter.post('/:operator/', checkOperator, Corretora.create);
// corretoraRouter.get('/:operator/:id', checkOperator, Corretora.show);
// corretoraRouter.put('/:operator/:id', checkOperator, Corretora.update);
// corretoraRouter.delete('/:operator/:id', checkOperator, Corretora.destroy);

export default corretoraRouter;
