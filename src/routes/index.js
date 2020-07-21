import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';
import parcelaController from '../app/controllers/parcelaController';
import loteController from '../app/controllers/loteController';
import ocorrenciaController from '../app/controllers/ocorrenciaController';

import gettersController from '../app/controllers/gettersController';

// import Parcela from '../app/models/Sequelize/Parcela';

const routes = new Router();

routes.get('/ping', (req, res) => {
  return res.send('Pong!');
});

// Rotas do servidor de cobrança

routes.get('/parcelas/', gettersController.parcelas);

routes.get(
  '/parcelas/:operator/query/srv',
  operatorMiddleware,
  parcelaController.filterParecelas
);

// routes.get('/:operator/testando', operatorMiddleware, async (req, res) => {
//   try {
//     const parcelas = await Parcela.sequelize;
//     console.log(parcelas);
//     res.send('ok');
//   } catch (err) {
//     console.log(err);
//     res.json({ error: true });
//   }
//   // console.log(await Parcela.findAll());

//   // res.send('ok');
// });

/**
 * Rotas referente a parcelas
 */
routes.get('/parcelas/:operator', operatorMiddleware, parcelaController.index);

routes.get(
  '/parcelas/:operator/:id',
  operatorMiddleware,
  parcelaController.show
);
routes.put(
  '/parcelas/:operator/:id',
  operatorMiddleware,
  parcelaController.update
);

// routes.delete('/:operator/parcelas/:id', operatorMiddleware);
routes.post('/parcelas/:operator', operatorMiddleware, parcelaController.store);

// Faz a baixa de um array de parcelas
routes.put(
  '/parcelas/:operator/void/baixa',
  operatorMiddleware,
  parcelaController.baixaParcelas
);

// Faz a baixa de uma única parcela
routes.put(
  '/parcelas/:operator/:id/baixa',
  operatorMiddleware,
  parcelaController.baixaParcela
);

/**
 * Rotas referentes a Lotes
 */
routes.get('/lotes/:operator', operatorMiddleware, loteController.index);
routes.post('/lotes/:operator', operatorMiddleware, loteController.store);
routes.put('/lotes/:operator/:id', operatorMiddleware, loteController.update);

/**
 * Rotas referentes a ocorrencias
 */
routes.get(
  '/ocorrencias/:operator',
  operatorMiddleware,
  ocorrenciaController.index
);
routes.post(
  '/ocorrencias/:operator',
  operatorMiddleware,
  ocorrenciaController.store
);
routes.put(
  '/ocorrencias/:operator/:id',
  operatorMiddleware,
  ocorrenciaController.update
);

export default routes;
