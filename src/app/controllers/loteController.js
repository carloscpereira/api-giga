import * as Yup from 'yup';
import LoteQuerier from '../schemas/LoteQuerier';
import LotePagamento from '../models/LotePagamento';

class LoteController {
  async index(req, res) {
    try {
      const querier = new LoteQuerier(req.query, req.knex('lotepagamento'));
      const lotes = await querier.run();

      res.json({ error: null, data: lotes });
    } catch (err) {
      console.log(err);
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

      const response = await new LotePagamento(req.pool).create({
        statusid,
        datacadastro,
        pessoausuarioid,
        lop_dt_baixa,
        lop_id_pessoa,
        lop_id_tipo_baixa,
        lop_in_tipo_movimento,
        lop_id_contrato,
        lop_in_cobranca,
      });

      if (response && response.error) {
        return res.status(response.error).json(response);
      }

      return res.json({ error: null, data: response });
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
        statusid: Yup.number().integer(),
        pessoausuarioid: Yup.number().integer(),
        lop_dt_baixa: Yup.date(),
        lop_id_pessoa: Yup.number().integer(),
        lop_id_tipo_baixa: Yup.number().integer(),
        lop_in_tipo_movimento: Yup.string(),
        lop_id_contrato: Yup.number().integer(),
        lop_in_cobranca: Yup.boolean(),
      });

      schema.validate(req.body);

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

      const response = await new LotePagamento(req.pool).update({
        id,
        statusid,
        pessoausuarioid,
        lop_dt_baixa,
        lop_id_pessoa,
        lop_id_tipo_baixa,
        lop_in_tipo_movimento,
        lop_id_contrato,
        lop_in_cobranca,
      });

      if (response && response.error) {
        return res.status(response.error).json(response);
      }

      return res.json({ error: null, data: response });
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
