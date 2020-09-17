import queryStringConverter from 'sequelize-querystring-converter';

import LogContato from '../models/Sequelize/LogContato';

class LogContatoController {
  async index(req, res) {
    const { limit = 20, page = 1, ...query } = req.params;

    const criteria = queryStringConverter.convert({ query });

    const logs = await LogContato.findAll({
      limit,
      offset: (page - 1) * limit,
      ...criteria,
    });

    res.json({ error: null, data: logs });
  }

  async show(req, res) {
    const { id } = req.params;

    const log = await LogContato.findByPk(id);

    return res.json({ error: null, data: log });
  }

  async update(req, res) {
    const {
      params: { id = null },
      body: {
        tipo_id = null,
        body_request = null,
        response_request = null,
        return_code = null,
        parcela_id = null,
        is_error = null,
      },
    } = req;

    const data = {
      ...(tipo_id ? { tipo_id } : {}),
      ...(body_request ? { body_request } : {}),
      ...(response_request ? { response_request } : {}),
      ...(return_code ? { return_code } : {}),
      ...(parcela_id ? { parcela_id } : {}),
      ...(is_error ? { is_error } : {}),
    };

    const log = (await LogContato.findByPk(id)).update(data);

    return res.json({ error: null, data: log });
  }

  async store(req, res) {
    const {
      tipo_id = null,
      body_request = null,
      response_request = null,
      return_code = null,
      parcela_id = null,
      is_error = null,
    } = req.body;

    const data = {
      tipo_id,
      body_request,
      response_request,
      return_code,
      parcela_id,
      is_error,
    };

    const log = await LogContato.create(data);

    return res.json({ error: null, data: log });
  }

  async delete(req, res) {
    const { id } = req.params;

    await (await LogContato.findByPk(id)).destroy();

    return res.status(201).json({ error: null, data: { message: 'Log successfully deleted ' } });
  }
}

export default new LogContatoController();
