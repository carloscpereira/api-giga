import { Router } from 'express';

import Vendedor from '../app/controllers/vendedorController';

import { checkOperator } from '../app/middlewares';

const vendededorRouter = new Router();

vendededorRouter.get('/:operator/', checkOperator, Vendedor.index);
// vendededorRouter.post('/:operator/', checkOperator, Vendedor.create);
// vendededorRouter.get('/:operator/:id', checkOperator, Vendedor.show);
// vendededorRouter.put('/:operator/:id', checkOperator, Vendedor.update);
// vendededorRouter.delete('/:operator/:id', checkOperator, Vendedor.destroy);

export default vendededorRouter;
