import { Router } from 'express';

/**
 * Import Middlewares
 */
import { checkOperator } from '../app/middlewares';

/**
 *  Import Controllers
 */
import PessoaJuridicaController from '../app/controllers/pessoaJurificaController';

const routes = new Router();

routes.get('/:operator', checkOperator, PessoaJuridicaController.index);

export default routes;
