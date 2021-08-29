import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import gettersController from '../app/controllers/gettersController';
import parcelaController from '../app/controllers/parcelaController';
import baixaParcelaController from '../app/controllers/baixaParcelaController';
import boletoController from '../app/controllers/boletoController';

import validateBaixaParcelaStore from '../app/validators/BaixaParcelaStore';

import newParcelaController from '../app/controllers/newParcelaController';

const routes = new Router();

routes.get('/:operator/homolog', operatorMiddleware, newParcelaController.index);

routes.get('/', gettersController.parcelas);

routes.get('/newFilter', gettersController.newParcelas);

routes.get('/:operator/query/srv', operatorMiddleware, parcelaController.filterParecelas);

routes.get('/:operator/query/srv', operatorMiddleware, parcelaController.filterParecelas);

routes.get('/:operator', operatorMiddleware, parcelaController.index);

routes.get('/:operator/:id', operatorMiddleware, parcelaController.show);
routes.put('/:operator/:id', operatorMiddleware, parcelaController.update);

routes.put('/:operator/:id/pause', operatorMiddleware, parcelaController.pause);
routes.put('/:operator/:id/start', operatorMiddleware, parcelaController.start);
routes.put('/:operator/:id/in-cobranca', operatorMiddleware, parcelaController.addCobranca);
routes.put('/:operator/:id/out-cobranca', operatorMiddleware, parcelaController.remCobranca);

routes.post('/:operator', operatorMiddleware, parcelaController.store);

// Faz a baixa de um array de parcelas
routes.put('/:operator/void/baixa', operatorMiddleware, parcelaController.baixaParcelas);

// Faz a baixa de uma única parcela
routes.post('/:operator/:id/baixa', operatorMiddleware, validateBaixaParcelaStore, baixaParcelaController.store);

routes.delete('/:operator/:id/baixa', operatorMiddleware, baixaParcelaController.destroy);

routes.delete('/:operator/:id/boleto', operatorMiddleware, boletoController.destroy);

export default routes;
