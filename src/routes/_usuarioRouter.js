import { Router } from 'express';

import UsuarioControler from '../app/controllers/usuarioController';

import { checkOperator } from '../app/middlewares';

const usuarioRouter = new Router();

usuarioRouter.get('/:operator/todos', checkOperator, UsuarioControler.index);
usuarioRouter.get('/:operator/', checkOperator, UsuarioControler.show);
usuarioRouter.post('/:operator/', checkOperator, UsuarioControler.create);
usuarioRouter.put('/:operator/:id', checkOperator, UsuarioControler.update);
usuarioRouter.delete('/:operator/:id', checkOperator, UsuarioControler.destroy);

export default usuarioRouter;
