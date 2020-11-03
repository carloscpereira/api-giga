import queryStringConverter from 'sequelize-querystring-converter';

import Departamento from '../models/Sequelize/Departamento';

class DepartamentoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const departamentos = await Departamento.findAll(criteria);
    return res.json({ error: null, data: departamentos });
  }

  async show(req, res) {
    const { id } = req.params;

    const departamento = await Departamento.findByPk(id);

    return res.json({ error: null, data: departamento });
  }

  async create(req, res) {
    const { descricao, codantigo, tipoconsignataria } = req.body;

    if (!descricao) throw new Error('Informe o Departamento que deseja criar');
    if (!tipoconsignataria) throw new Error('Você precisa informar um dipo de consignataria');

    const departamento = await Departamento.create({ departamento: descricao, codantigo, tipoconsignataria });

    return res.json({ error: null, data: departamento });
  }

  async update(req, res) {
    const {
      body: { descricao = null, codantigo = null, tipoconsignataria = null },
      params: { id },
    } = req;

    const departamento = await Departamento.findByPk(id);

    if (!departamento) throw new Error('Departamento não encontrado');

    const data = {
      ...(descricao ? { departamento: descricao } : {}),
      ...(codantigo ? { codantigo } : {}),
      ...(tipoconsignataria ? { tipoconsignataria } : {}),
    };

    departamento.update(data);

    return res.json({ error: null, data: departamento });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const departamento = await Departamento.findByPk(id);

    if (!departamento) throw new Error('Departamento não encontrado');

    departamento.destroy();

    return res.json({ error: null });
  }
}

export default new DepartamentoController();
