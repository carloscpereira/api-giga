import queryStringConverter from 'sequelize-querystring-converter';
import Vinculo from '../models/Sequelize/Vinculo';
import TipoContrato from '../models/Sequelize/TipoContrato';

class VinculoController {
  async index(req, res) {
    const { page = 1, limit = 20, tipocontrato, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    const vinculos = await Vinculo.findAll({
      ...criteria,
      include: [{ model: TipoContrato, as: 'tipocontratos', attributes: [], where: { id: tipocontrato } }],
    });
    return res.json({ error: null, data: vinculos });
  }

  async show(req, res) {
    const { id } = req.params;

    const vinculo = await Vinculo.findByPk(id);

    return res.json({ error: null, data: vinculo });
  }

  async create(req, res) {
    const { descricao, tipopessoa, sistema } = req.body;

    const vinculo = await Vinculo.create({ descricao, tipopessoa, sistema });

    return res.json({ error: null, data: vinculo });
  }

  async update(req, res) {
    const {
      params: { id },
      body: { descricao = null, tipopessoa = 'F', sistema = 0 },
    } = req;

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(tipopessoa ? { tipopessoa } : {}),
      ...(sistema ? { sistema } : {}),
    };

    const vinculo = await Vinculo.findByPk(id);

    if (!vinculo) throw new Error('Vinculo não encontrado');

    vinculo.update(data);

    return res.json({ error: null, data: vinculo });
  }

  async destroy(req, res) {
    const { id } = req.params;

    const vinculo = await Vinculo.findByPk(id);

    if (!vinculo) throw new Error('Vinculo não encontrado');

    vinculo.destroy();

    return res.json({ error: null });
  }
}

export default new VinculoController();
