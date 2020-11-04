import { Router } from 'express';

import ProdutoController from '../app/controllers/produtoController';

import { checkOperator } from '../app/middlewares';

const produtoRouter = new Router();

produtoRouter.get('/:operator/', checkOperator, ProdutoController.index);
produtoRouter.post('/:operator/', checkOperator, ProdutoController.create);
produtoRouter.get('/:operator/:id', checkOperator, ProdutoController.show);
produtoRouter.put('/:operator/:id', checkOperator, ProdutoController.update);
produtoRouter.delete('/:operator/:id', checkOperator, ProdutoController.destroy);

export default produtoRouter;
