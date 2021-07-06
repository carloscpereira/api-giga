/* eslint-disable import/no-named-as-default */
import queryStringConverter from 'sequelize-querystring-converter';

import CMF from '../models/Sequelize/CentroMovimentacaoFinanceira';

class CentroMovimentacaoFinanceiraController {
  async index(req, res) {
    const { page = 1, limit, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { ...(limit ? { offset: (page - 1) * limit, limit } : {}), ...query },
    });

    console.log(criteria);

    const centroMovimentacaoFinanceira = await CMF.findAll({
      ...criteria,
    });

    return res.json({ error: null, data: centroMovimentacaoFinanceira });
  }

  async show(req, res) {
    const {
      params: { id },
    } = req;

    const centroMovimentacaoFinanceira = await CMF.findByPk(id);

    return res.json({ error: null, data: centroMovimentacaoFinanceira });
  }
}

export default new CentroMovimentacaoFinanceiraController();
