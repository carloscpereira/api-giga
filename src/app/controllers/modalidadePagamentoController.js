import queryStringConverter from 'sequelize-querystring-converter';

import ModalidadePagamento from '../models/Sequelize/ModalidadePagamento';

class ModalidadePagamentoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const offset = (page - 1) * limit;

    const criteria = queryStringConverter.convert({
      limit,
      offset,
      query,
    });

    const modalidadesPagamento = await ModalidadePagamento.findAll({ ...criteria });

    return res.json({ error: null, data: modalidadesPagamento });
  }

  async show(req, res) {
    const { id } = req.params;

    const modalidadePagamento = await ModalidadePagamento.findByPk(id);

    return res.json({ error: null, data: modalidadePagamento });
  }

  async update(req, res) {
    const {
      body: { descricao = null, cartaocredito = null },
      params: { id },
    } = req;

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(cartaocredito ? { cartaocredito } : {}),
    };

    const modalidadePagamento = await ModalidadePagamento.update(data, {
      where: {
        id,
      },
      returning: true,
    });

    return res.status(201).json({ error: null, data: modalidadePagamento });
  }

  async store(req, res) {
    const { descricao, cartaocredito } = req.body;

    const data = {
      descricao,
      cartaocredito,
    };

    const modalidadePagamento = await ModalidadePagamento.create(data);

    return res.status(201).json({ error: null, data: modalidadePagamento });
  }
}

export default new ModalidadePagamentoController();
