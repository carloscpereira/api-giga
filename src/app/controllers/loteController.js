import * as Yup from 'yup';
import queryStringConverter from 'sequelize-querystring-converter';

import LotePagamento from '../models/Sequelize/LotePagamento';
import Parcela from '../models/Sequelize/Parcela';
import FormaPagamento from '../models/Sequelize/FormaPagamento';

class LoteController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, ...query } = req.query;

      const criteria = queryStringConverter.convert({
        query: { limit, ...query, offset: (page - 1) * limit },
      });

      console.log(criteria);
      const lotes = await LotePagamento.findAll({
        include: [
          {
            model: Parcela,
            as: 'parcelas',
            include: [{ model: FormaPagamento, as: 'pagamento' }],
          },
        ],
        ...criteria,
      });

      return res.json({ error: null, data: lotes });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal Server Error' } });
    }
  }

  async show(req, res) {
    try {
      const schema = Yup.number().integer();

      const { id } = req.params;

      await schema.validate(id);

      const lote = await LotePagamento.findByPk(id);

      return res.json({ error: null, data: lote });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        statusid: Yup.number().integer(),
        lop_in_tipo_movimento: Yup.string().required(),
        lop_in_cobranca: Yup.boolean(),
        pessoausuarioid: Yup.number().integer(),
      });

      await schema.validate(req.body);

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
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        body: Yup.object().shape({
          statusid: Yup.number().integer(),
          pessoausuarioid: Yup.number().integer(),
          lop_dt_baixa: Yup.date(),
          lop_id_pessoa: Yup.number().integer(),
          lop_id_tipo_baixa: Yup.number().integer(),
          lop_in_tipo_movimento: Yup.string(),
          lop_id_contrato: Yup.number().integer(),
          lop_in_cobranca: Yup.boolean(),
        }),
        params: Yup.object().shape({
          id: Yup.number().integer().required(),
        }),
      });

      schema.validate(req);

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
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new LoteController();
