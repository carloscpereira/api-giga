import queryStringConverter from 'sequelize-querystring-converter';

import Plano from '../models/Sequelize/Plano';

class PlanoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const planos = await Plano.findAll(criteria);
    return res.json({ error: null, data: planos });
  }

  async show(req, res) {
    const { id } = req.params;

    const plano = await Plano.findByPk(id);

    return res.json({ error: null, data: plano });
  }

  async create(req, res) {
    const { descricao = null, codigo = null, tipopessoa = null, pla_in_anterior_lei = null } = req.body;

    if (!descricao || !codigo || !tipopessoa || !pla_in_anterior_lei) {
      throw new Error(
        'Os campos `descricao`, `codigo`, `tipopessoa` e `pla_in_anterior_lei` são obrigatórios para criar um Plano'
      );
    }

    const data = {
      descricao,
      codigo,
      tipopessoa,
      pla_in_anterior_lei,
    };

    const plano = await Plano.create(data);

    return res.json({ error: null, data: plano });
  }

  async update(req, res) {
    const {
      body: { descricao = null, codigo = null, tipopessoa = null, pla_in_anterior_lei = null },
      params: { id },
    } = req;

    const plano = await Plano.findByPk(id);

    if (!plano) throw new Error('Plano não encontrado');

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(codigo ? { codigo } : {}),
      ...(tipopessoa ? { tipopessoa } : {}),
      ...(pla_in_anterior_lei ? { pla_in_anterior_lei } : {}),
    };

    plano.update(data);

    return res.json({ error: null, data: plano });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const plano = await Plano.findByPk(id);

    if (!plano) throw new Error('Plano não encontrado');

    plano.destroy();

    return res.json({ error: null });
  }
}

export default new PlanoController();
