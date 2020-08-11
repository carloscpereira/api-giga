import queryStringConverter from 'sequelize-querystring-converter';

import LotePagamento from '../models/Sequelize/LotePagamento';
import Parcela from '../models/Sequelize/Parcela';
import FormaPagamento from '../models/Sequelize/FormaPagamento';

class LoteController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;

    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    const lotes = await LotePagamento.findAll({
      include: [
        {
          model: Parcela,
          as: 'parcelas',
          // through: { attributes: ['pal_dt_pagamento'] },
          include: [
            {
              model: FormaPagamento,
              as: 'pagamentos',
            },
          ],
        },
      ],
      ...criteria,
    });

    return res.json({ error: null, data: lotes });
  }

  async show(req, res) {
    const { id } = req.params;

    const lote = await LotePagamento.findByPk(id);

    return res.json({ error: null, data: lote });
  }

  async store(req, res) {
    const {
      statusid = 1,
      datacadastro = new Date(),
      pessoausuarioid = null,
      lop_dt_baixa = null,
      lop_id_pessoa = null,
      lop_id_tipo_baixa = null,
      lop_in_tipo_movimento = null,
      lop_id_contrato = null,
      lop_in_cobranca = null,
    } = req.body;

    const data = {
      statusid,
      datacadastro,
      pessoausuarioid,
      lop_dt_baixa,
      lop_id_pessoa,
      lop_id_tipo_baixa,
      lop_in_tipo_movimento,
      lop_id_contrato,
      lop_in_cobranca,
    };

    const newLote = await LotePagamento.create(data);

    return res.json({ error: null, data: newLote });
  }

  async update(req, res) {
    const {
      body: {
        statusid = 1,
        pessoausuarioid = null,
        lop_dt_baixa = null,
        lop_id_pessoa = null,
        lop_id_tipo_baixa = null,
        lop_in_tipo_movimento = null,
        lop_id_contrato = null,
        lop_in_cobranca = null,
      },
      params: { id = null },
    } = req;

    const data = {
      ...(statusid ? { statusid } : {}),
      ...(pessoausuarioid ? { pessoausuarioid } : {}),
      ...(lop_dt_baixa ? { lop_dt_baixa } : {}),
      ...(lop_id_pessoa ? { lop_id_pessoa } : {}),
      ...(lop_id_tipo_baixa ? { lop_id_tipo_baixa } : {}),
      ...(lop_in_tipo_movimento ? { lop_in_tipo_movimento } : {}),
      ...(lop_id_contrato ? { lop_id_contrato } : {}),
      ...(lop_in_cobranca ? { lop_in_cobranca } : {}),
    };

    const lote = await LotePagamento.update(data, {
      where: { id },
      returning: true,
    });

    return res.json({ error: null, data: lote });
  }
}

export default new LoteController();
