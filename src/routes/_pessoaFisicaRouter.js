import { Router } from 'express';

/**
 * Import Middlewares
 */
import { checkOperator } from '../app/middlewares';

/**
 *  Import Controllers
 */
import PessoaFisicaController from '../app/controllers/pessoaFisicaController';

const routes = new Router();

routes.get('/:operator', checkOperator, PessoaFisicaController.index);
routes.post('/:operator', checkOperator, PessoaFisicaController.store);

module.exports = routes;
