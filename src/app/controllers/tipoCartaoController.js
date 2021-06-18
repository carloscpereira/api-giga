import queryStringConverter from 'sequelize-querystring-converter';

import TipoCartao from '../models/Sequelize/TipoCartao';

class TipoCartaoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const tiposContrato = await TipoCartao.findAll(criteria);
    return res.json({ error: null, data: tiposContrato });
  }

  async show(req, res) {
    const { id } = req.params;

    const tipoCartao = await TipoCartao.findByPk(id);

    return res.json({ error: null, data: tipoCartao });
  }
}

export default new TipoCartaoController();
