import queryStringConverter from 'sequelize-querystring-converter';

import Agencia from '../models/Sequelize/Agencia';
import Banco from '../models/Sequelize/Banco';

class AgenciaController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const agencias = await Agencia.findAll({ ...criteria, include: [{ model: Banco, as: 'banco' }] });
    return res.json({ error: null, data: agencias });
  }

  async show(req, res) {
    const { id } = req.params;

    const agencia = await Agencia.findByPk(id, { include: [{ model: Banco, as: 'banco' }] });

    return res.json({ error: null, data: agencia });
  }

  async create(req, res) {
    const { bancoid = null, codigo = null, digito = null, descricao = null } = req.body;

    const banco = await Banco.findByPk(bancoid);

    if (!banco) throw new Error('Código de banco informado inválido');

    if (!codigo || !digito || !descricao)
      throw new Error('Os campos `codigo`, `digito` e `descricao` são obrigatórios para criar uma agência');

    const data = {
      bancoid,
      codigo,
      digito,
      descricao,
    };

    const agencia = await Agencia.create(data);

    return res.json({ error: null, data: agencia });
  }

  async update(req, res) {
    const {
      body: { bancoid = null, codigo = null, digito = null, descricao = null },
      params: { id },
    } = req;

    if (bancoid) {
      const banco = await Banco.findByPk(bancoid);

      if (!banco) throw new Error('Código de banco informado inválido');
    }

    const agencia = await Agencia.findByPk(id);

    if (!agencia) throw new Error('Agencia não encontrado');

    const data = {
      ...(bancoid ? { bancoid } : {}),
      ...(codigo ? { codigo } : {}),
      ...(digito ? { digito } : {}),
      ...(descricao ? { descricao } : {}),
    };

    agencia.update(data);

    return res.json({ error: null, data: agencia });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const agencia = await Agencia.findByPk(id);

    if (!agencia) throw new Error('Setor não encontrado');

    agencia.destroy();

    return res.json({ error: null });
  }
}

export default new AgenciaController();
