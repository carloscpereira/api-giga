/* eslint-disable import/no-named-as-default */
import queryStringConverter from 'sequelize-querystring-converter';

// eslint-disable-next-line import/no-named-as-default-member
import CentroCusto from '../models/Sequelize/CentroCusto';
import Setor from '../models/Sequelize/Setor';
import Departamento from '../models/Sequelize/Departamento';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';

class CentroCustoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const centroCustos = await CentroCusto.findAll({
      ...criteria,
      include: [
        { model: PessoaJuridica, as: 'empresa' },
        { model: Setor, as: 'setor', attributes: ['id', 'descricao'] },
        { model: Departamento, as: 'departamento', attributes: ['id', 'descricao'] },
      ],
    });
    return res.json({ error: null, data: centroCustos });
  }

  async show(req, res) {
    const {
      params: { id },
    } = req;

    const centroCusto = await CentroCusto.findByPk(id);

    return res.json({ error: null, data: centroCusto });
  }

  async create(req, res) {
    const {
      descricao = null,
      quantidadefuncionario = null,
      numerometroquadrado = null,
      numerofator = null,
      departamentoid = null,
      setorid = null,
      empresaid = null,
      nomefantasiacarteira = null,
      localid = null,
      assuntoid = null,
    } = req.body;

    const data = {
      descricao,
      quantidadefuncionario,
      numerometroquadrado,
      numerofator,
      departamentoid,
      setorid,
      empresaid,
      nomefantasiacarteira,
      localid,
      assuntoid,
    };

    const centroCusto = await CentroCusto.create(data);

    return res.json({ error: null, data: centroCusto });
  }

  async update(req, res) {
    const {
      body: {
        descricao = null,
        quantidadefuncionario = null,
        numerometroquadrado = null,
        numerofator = null,
        departamentoid = null,
        setorid = null,
        empresaid = null,
        nomefantasiacarteira = null,
        localid = null,
        assuntoid = null,
      },
      params: { id },
    } = req;

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(quantidadefuncionario ? { quantidadefuncionario } : {}),
      ...(numerometroquadrado ? { numerometroquadrado } : {}),
      ...(numerofator ? { numerofator } : {}),
      ...(departamentoid ? { departamentoid } : {}),
      ...(setorid ? { setorid } : {}),
      ...(empresaid ? { empresaid } : {}),
      ...(nomefantasiacarteira ? { nomefantasiacarteira } : {}),
      ...(localid ? { localid } : {}),
      ...(assuntoid ? { assuntoid } : {}),
    };

    const centroCusto = await CentroCusto.findByPk(id);

    if (!centroCusto) throw new Error('Centro Custo não encontrado');

    await centroCusto.update(data);

    return res.json({ error: null, data: centroCusto });
  }

  async destroy(req, res) {
    const { id } = req.params;

    const centroCusto = await CentroCusto.findByPk(id);

    if (!centroCusto) throw new Error('Centro Custo não encontrado');

    centroCusto.destroy();

    return res.json({ error: null });
  }
}

export default new CentroCustoController();
