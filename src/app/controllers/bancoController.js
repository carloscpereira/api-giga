import queryStringConverter from 'sequelize-querystring-converter';

import Banco from '../models/Sequelize/Banco';

class BancoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const bancos = await Banco.findAll({ ...criteria, include: [{ model: Banco, as: 'banco' }] });
    return res.json({ error: null, data: bancos });
  }

  async show(req, res) {
    const { id } = req.params;

    const banco = await Banco.findByPk(id, { include: [{ model: Banco, as: 'banco' }] });

    return res.json({ error: null, data: banco });
  }

  async create(req, res) {
    const {
      descricao = null,
      codigo = null,
      digito = null,
      descricao_boleto = null,
      logomarca_boleto = null,
      codigo_moeda = null,
      site = null,
    } = req.body;

    if (!codigo || !digito || !descricao || codigo_moeda || site || descricao_boleto)
      throw new Error(
        'Os campos `codigo`, `digito`, `codigo_moedas`, `site`, `descricao_boleto` e `descricao` são obrigatórios para criar um Banco'
      );

    const data = {
      descricao,
      codigo,
      digito,
      descricao_boleto,
      logomarca_boleto,
      codigo_moeda,
      site,
    };

    const banco = await Banco.create(data);

    return res.json({ error: null, data: banco });
  }

  async update(req, res) {
    const {
      body: {
        descricao = null,
        codigo = null,
        digito = null,
        descricao_boleto = null,
        logomarca_boleto = null,
        codigo_moeda = null,
        site = null,
      },
      params: { id },
    } = req;

    const banco = await Banco.findByPk(id);

    if (!banco) throw new Error('Banco não encontrado');

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(codigo ? { codigo } : {}),
      ...(digito ? { digito } : {}),
      ...(descricao_boleto ? { descricao_boleto } : {}),
      ...(logomarca_boleto ? { logomarca_boleto } : {}),
      ...(codigo_moeda ? { codigo_moeda } : {}),
      ...(site ? { site } : {}),
    };

    banco.update(data);

    return res.json({ error: null, data: banco });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const banco = await Banco.findByPk(id);

    if (!banco) throw new Error('Setor não encontrado');

    banco.destroy();

    return res.json({ error: null });
  }
}

export default new BancoController();
