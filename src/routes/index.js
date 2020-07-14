import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';
import parcelaController from '../app/controllers/parcelaController';
import loteController from '../app/controllers/loteController';
import ocorrenciaController from '../app/controllers/ocorrenciaController';

const routes = new Router();

routes.get('/ping', (req, res) => {
  return res.send('Pong!');
});

/**
 * Rotas referente a parcelas
 */
routes.get('/:operator/parcelas', operatorMiddleware, parcelaController.index);
routes.get(
  '/:operator/parcelas/:id',
  operatorMiddleware,
  parcelaController.show
);
routes.put(
  '/:operator/parcelas/:id',
  operatorMiddleware,
  parcelaController.update
);
// routes.delete('/:operator/parcelas/:id', operatorMiddleware);
routes.post('/:operator/parcelas', operatorMiddleware, parcelaController.store);

// Faz a baixa de um array de parcelas
routes.put(
  '/:operator/parcelas/void/baixa',
  operatorMiddleware,
  parcelaController.baixaParcelas
);

// Faz a baixa de uma única parcela
routes.put(
  '/:operator/parcelas/:id/baixa',
  operatorMiddleware,
  parcelaController.baixaParcela
);

/**
 * Rotas referentes a Lotes
 */
routes.get('/:operator/lotes', operatorMiddleware, loteController.index);
routes.post('/:operator/lotes', operatorMiddleware, loteController.store);
routes.put('/:operator/lotes/:id', operatorMiddleware, loteController.update);

/**
 * Rotas referentes a ocorrencias
 */
routes.get(
  '/:operator/ocorrencias',
  operatorMiddleware,
  ocorrenciaController.index
);
routes.post(
  '/:operator/ocorrencias',
  operatorMiddleware,
  ocorrenciaController.store
);
routes.put(
  '/:operator/ocorrencias/:id',
  operatorMiddleware,
  ocorrenciaController.update
);

export default routes;
