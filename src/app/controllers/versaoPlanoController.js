import queryStringConverter from 'sequelize-querystring-converter';

import VersaoPlano from '../models/Sequelize/VersaoPlano';

class VersaoPlanoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const versaoplanos = await VersaoPlano.findAll(criteria);
    return res.json({ error: null, data: versaoplanos });
  }

  async show(req, res) {
    const { id } = req.params;

    const versaoplano = await VersaoPlano.findByPk(id);

    return res.json({ error: null, data: versaoplano });
  }

  async create(req, res) {
    const {
      descricao = null,
      codigo = null,
      quantidademinimabeneficiarios = null,
      quantidademaximabeneficiarios = null,
      periodovencimento = null,
      qtdparcelascustomizado = null,
    } = req.body;

    if (
      !descricao ||
      !codigo ||
      !quantidademinimabeneficiarios ||
      !quantidademaximabeneficiarios ||
      !periodovencimento ||
      !qtdparcelascustomizado
    ) {
      throw new Error(
        'Os campos `descricao`, `codigo`, `quantidademinimabeneficiarios`,`quantidademaximabeneficiarios`, `periodovencimento` e `qtdparcelascustomizado` são obrigatórios para criar um VersaoPlano'
      );
    }

    const data = {
      descricao,
      codigo,
      quantidademinimabeneficiarios,
      quantidademaximabeneficiarios,
      periodovencimento,
      qtdparcelascustomizado,
    };

    const versaoplano = await VersaoPlano.create(data);

    return res.json({ error: null, data: versaoplano });
  }

  async update(req, res) {
    const {
      body: {
        descricao = null,
        codigo = null,
        quantidademinimabeneficiarios = null,
        quantidademaximabeneficiarios = null,
        periodovencimento = null,
        qtdparcelascustomizado = null,
      },
      params: { id },
    } = req;

    const versaoplano = await VersaoPlano.findByPk(id);

    if (!versaoplano) throw new Error('VersaoPlano não encontrado');

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(codigo ? { codigo } : {}),
      ...(quantidademinimabeneficiarios ? { quantidademinimabeneficiarios } : {}),
      ...(quantidademaximabeneficiarios ? { quantidademaximabeneficiarios } : {}),
      ...(periodovencimento ? { periodovencimento } : {}),
      ...(qtdparcelascustomizado ? { qtdparcelascustomizado } : {}),
    };

    versaoplano.update(data);

    return res.json({ error: null, data: versaoplano });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const versaoplano = await VersaoPlano.findByPk(id);

    if (!versaoplano) throw new Error('VersaoPlano não encontrado');

    versaoplano.destroy();

    return res.json({ error: null });
  }
}

export default new VersaoPlanoController();
