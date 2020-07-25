import * as Yup from 'yup';
import LogCartaoCredito from '../models/Sequelize/LogCartaoCredito';

class LogCartaoCreditoController {
  async index(req, res) {
    const logs = await LogCartaoCredito.findAll();

    res.json({ error: null, data: logs });
  }

  async show(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      schema.validate(req.params);

      const { id } = req.params;

      const log = await LogCartaoCredito.findByPk(id);

      return res.json({ error: null, data: log });
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
        params: Yup.object().shape({
          id: Yup.number().integer().required(),
        }),
        body: Yup.object().shape({
          tid: Yup.string(),
          authorization_code: Yup.string(),
          payment_id: Yup.string(),
          return_message: Yup.string(),
          return_code: Yup.number().integer(),
          establishment: Yup.number().integer(),
          parcelaid: Yup.number().integer(),
          response: Yup.string(),
          processamento: Yup.date(),
        }),
      });

      await schema.validate(req);

      const {
        params: { id = null },
        body: {
          tid = null,
          authorization_code = null,
          payment_id = null,
          return_message = null,
          return_code = null,
          establishment = null,
          parcelaid = null,
          response = null,
          processamento = null,
        },
      } = req;

      const data = {
        ...(tid ? { tid } : {}),
        ...(authorization_code ? { authorization_code } : {}),
        ...(payment_id ? { payment_id } : {}),
        ...(return_message ? { return_message } : {}),
        ...(return_code ? { return_code } : {}),
        ...(establishment ? { establishment } : {}),
        ...(parcelaid ? { parcelaid } : {}),
        ...(response ? { response } : {}),
        ...(processamento ? { processamento } : {}),
      };

      const log = (await LogCartaoCredito.findByPk(id)).update(data);

      return res.json({ error: null, data: log });
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
        tid: Yup.string().required(),
        authorization_code: Yup.string().required(),
        payment_id: Yup.string().required(),
        return_message: Yup.string().required(),
        return_code: Yup.number().integer().required(),
        establishment: Yup.number().integer().required(),
        parcelaid: Yup.number().integer().required(),
        response: Yup.string(),
        processamento: Yup.date().required(),
      });

      await schema.validate(req.body);

      const {
        tid = null,
        authorization_code = null,
        payment_id = null,
        return_message = null,
        return_code = null,
        establishment = null,
        parcelaid = null,
        response = null,
        processamento = null,
      } = req.body;

      const data = {
        tid,
        authorization_code,
        payment_id,
        return_message,
        return_code,
        establishment,
        parcelaid,
        response,
        processamento,
      };

      const log = await LogCartaoCredito.create(data);

      return res.json({ error: null, data: log });
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

  async delete(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      schema.validate(req.params);

      const { id } = req.params;

      await (await LogCartaoCredito.findByPk(id)).destroy();

      return res
        .status(201)
        .json({ error: null, data: { message: 'Log successfully deleted ' } });
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

export default new LogCartaoCreditoController();
