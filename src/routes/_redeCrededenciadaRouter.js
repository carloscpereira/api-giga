import { Router } from 'express';

/**
 * Import Middlewares
 */
import { checkOperator } from '../app/middlewares';

/**
 *  Import Controllers
 */
import RedeCredenciadaController from '../app/controllers/redeCredenciadaController';
import ColaboradoresClinicasController from '../app/controllers/colaboradoresClinicasController';

const routes = new Router();

routes.get('/:operator', checkOperator, RedeCredenciadaController.index);
routes.get('/:operator/:idcontrato', checkOperator, RedeCredenciadaController.show);

// Rota Colaboradores
routes.get('/:operator/:idcontrato/colaboradores', checkOperator, ColaboradoresClinicasController.index);

export default routes;
