import { Router } from 'express';

/**
 * Import Middlewares
 */
import { checkOperator } from '../app/middlewares';

/**
 *  Import Controllers
 */
import FichaMedicaController from '../app/controllers/fichaMedicaController';

const fichaMedica = new Router();

fichaMedica.get('/:operator/:pessoaId', checkOperator, FichaMedicaController.show);

export default fichaMedica;
