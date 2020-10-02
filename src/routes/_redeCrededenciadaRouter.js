import { Router } from 'express';

/**
 * Import Middlewares
 */
import { checkOperator } from '../app/middlewares';

/**
 *  Import Controllers
 */
import RedeCredenciadaController from '../app/controllers/redeCredenciadaController';

const routes = new Router();

routes.get('/:operator', checkOperator, RedeCredenciadaController.index);

export default routes;
