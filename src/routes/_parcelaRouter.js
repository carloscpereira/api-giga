import { Router } from 'express';

import { checkOperator as operatorMiddleware } from '../app/middlewares';

import gettersController from '../app/controllers/gettersController';
import parcelaController from '../app/controllers/parcelaController';
import baixaParcelaController from '../app/controllers/baixaParcelaController';

import validateBaixaParcela from '../app/validators/BaixaParcela';
// Apagar
// import Parcela from '../app/models/Sequelize/Parcela';
// import ParcelaAcrescimoDesconto from '../app/models/Sequelize/ParcelaAcrescimoDesconto';
// import FormaPagamento from '../app/models/Sequelize/FormaPagamento';
// import LotePagamento from '../app/models/Sequelize/LotePagamento';

const routes = new Router();

// routes.get('/:operator/:id/sequelize', operatorMiddleware, async (req, res) => {
//   const parcelas = await Parcela.findByPk(req.params.id, {
//     include: [
//       {
//         model: ParcelaAcrescimoDesconto,
//         as: 'descontos',
//       },
//       {
//         model: FormaPagamento,
//         as: 'pagamentos',
//       },
//       {
//         model: LotePagamento,
//         as: 'lotes',
//       },
//     ],
//   });

//   return res.json({ parcelas });
// });

routes.get('/', gettersController.parcelas);

routes.get(
  '/:operator/query/srv',
  operatorMiddleware,
  parcelaController.filterParecelas
);

routes.get(
  '/:operator/query/srv',
  operatorMiddleware,
  parcelaController.filterParecelas
);

routes.get('/:operator', operatorMiddleware, parcelaController.index);

routes.get('/:operator/:id', operatorMiddleware, parcelaController.show);
routes.put('/:operator/:id', operatorMiddleware, parcelaController.update);

routes.put('/:operator/:id/pause', operatorMiddleware, parcelaController.pause);
routes.put('/:operator/:id/start', operatorMiddleware, parcelaController.start);
routes.put(
  '/:operator/:id/in-cobranca',
  operatorMiddleware,
  parcelaController.addCobranca
);
routes.put(
  '/:operator/:id/out-cobranca',
  operatorMiddleware,
  parcelaController.remCobranca
);

routes.post('/:operator', operatorMiddleware, parcelaController.store);

// Faz a baixa de um array de parcelas
routes.put(
  '/:operator/void/baixa',
  operatorMiddleware,
  parcelaController.baixaParcelas
);

// Faz a baixa de uma única parcela
routes.post(
  '/:operator/:id/baixa',
  operatorMiddleware,
  validateBaixaParcela,
  baixaParcelaController.store
);

module.exports = routes;
