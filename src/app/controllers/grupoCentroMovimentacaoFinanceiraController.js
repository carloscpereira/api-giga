/* eslint-disable import/no-named-as-default */
import queryStringConverter from 'sequelize-querystring-converter';

import CMF from '../models/Sequelize/CentroMovimentacaoFinanceira';
import GCMF from '../models/Sequelize/GrupoCentroMovimentacaoFinanceira';

class GrupoCentroMovimentacaoFinanceiraController {
  async index(req, res) {
    const { page = 1, limit, with: withColumn, ...query } = req.query;

    const criteria = queryStringConverter.convert({
      query: { ...(limit ? { offset: (page - 1) * limit, limit } : {}), ...query },
    });

    const grupoCentroMovimentacaoFinanceira = await GCMF.findAll({
      ...criteria,
      include: [
        ...(withColumn &&
        withColumn
          .split(',')
          .map((c) => c.trim())
          .includes('cmf')
          ? [{ model: CMF, as: 'cmfs' }]
          : []),
      ],
    });

    return res.json({ error: null, data: grupoCentroMovimentacaoFinanceira });
  }

  async show(req, res) {
    const {
      params: { id },
    } = req;

    const centroMovimentacaoFinanceira = await CMF.findByPk(id);

    return res.json({ error: null, data: centroMovimentacaoFinanceira });
  }
}

export default new GrupoCentroMovimentacaoFinanceiraController();
