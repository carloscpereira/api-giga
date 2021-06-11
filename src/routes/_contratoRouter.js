import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import contratoController from '../app/controllers/contratoController';

import validateStore from '../app/validators/ContratoStore';
import validateUpdate from '../app/validators/ContratoUpdate';
import validateAdicaoBeneficiario from '../app/validators/AdicaoBeneficiario';

const routes = new Router();

routes.get('/:operator', operatorMiddleware, contratoController.index);
routes.post('/:operator', operatorMiddleware, validateStore, contratoController.store);

routes.put('/:operator/:id', operatorMiddleware, validateUpdate, contratoController.update);
routes.put('/:operator/:id/migrar', operatorMiddleware, contratoController.migrar);

routes.get('/:operator/:id', operatorMiddleware, contratoController.show);
routes.put('/:operator/:id/block', operatorMiddleware, contratoController.block);
routes.put('/:operator/:id/unlock', operatorMiddleware, contratoController.unlock);
routes.delete('/:operator/:id', operatorMiddleware, contratoController.delete);
routes.post('/:operator/:id/enable', operatorMiddleware, contratoController.enable);
routes.delete('/:operator/:id/beneficiario/:beneficiarioid', operatorMiddleware, contratoController.removerAssociado);
routes.post(
  '/:operator/:id/beneficiario',
  operatorMiddleware,
  validateAdicaoBeneficiario,
  contratoController.adicionarAssociado
);

export default routes;
