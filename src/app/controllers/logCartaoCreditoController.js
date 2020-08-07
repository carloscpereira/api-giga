import LogCartaoCredito from '../models/Sequelize/LogCartaoCredito';

class LogCartaoCreditoController {
  async index(req, res) {
    const logs = await LogCartaoCredito.findAll();

    res.json({ error: null, data: logs });
  }

  async show(req, res) {
    const { id } = req.params;

    const log = await LogCartaoCredito.findByPk(id);

    return res.json({ error: null, data: log });
  }

  async update(req, res) {
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
  }

  async store(req, res) {
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
  }

  async delete(req, res) {
    const { id } = req.params;

    await (await LogCartaoCredito.findByPk(id)).destroy();

    return res
      .status(201)
      .json({ error: null, data: { message: 'Log successfully deleted ' } });
  }
}

export default new LogCartaoCreditoController();
