import { Router } from 'express';

import operatorMiddleware from '../app/middlewares/operator';
import parcelaController from '../app/controllers/parcelaController';
import loteController from '../app/controllers/loteController';
import ocorrenciaController from '../app/controllers/ocorrenciaController';

import gettersController from '../app/controllers/gettersController';

import Parcela from '../app/models/Sequelize/Parcela';
import FormaPagamento from '../app/models/Sequelize/FormaPagamento';
import Titulo from '../app/models/Sequelize/Titulo';
import Contrato from '../app/models/Sequelize/Contrato';
import Documento from '../app/models/Sequelize/Documento';

const routes = new Router();

routes.get('/ping', (req, res) => {
  return res.send('Pong!');
});

routes.get('/seq/parcelas/:operator', operatorMiddleware, async (req, res) => {
  const parcelas = await Parcela.findAll({
    limit: 2,
    include: [
      { model: FormaPagamento, as: 'pagamento' },
      {
        model: Titulo,
        as: 'titulo',
        include: [{ model: Contrato, as: 'contrato' }],
      },
      {
        model: Documento,
        as: 'documento',
        attributes: ['descricao'],
      },
    ],
  });

  return res.json({ parcelas });
});

// Rotas do servidor de cobrança

routes.get('/parcelas/', gettersController.parcelas);

routes.get(
  '/parcelas/:operator/query/srv',
  operatorMiddleware,
  parcelaController.filterParecelas
);

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
