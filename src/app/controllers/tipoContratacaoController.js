import queryStringConverter from 'sequelize-querystring-converter';

import TipoContratacao from '../models/Sequelize/TipoContratacao';

class TipoContratacaoController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const tipoContratacoes = await TipoContratacao.findAll(criteria);
    return res.json({ error: null, data: tipoContratacoes });
  }

  async show(req, res) {
    const { id } = req.params;

    const tipoContratacao = await TipoContratacao.findByPk(id);

    return res.json({ error: null, data: tipoContratacao });
  }

  // async create(req, res) {
  //   const { setor: paramasTipoContratacao = null } = req.body;

  //   if (!paramasTipoContratacao) throw new Error('Informe o TipoContratacao que deseja criar');

  //   const setor = await TipoContratacao.create({ setor: paramasTipoContratacao });

  //   return res.json({ error: null, data: setor });
  // }

  // async update(req, res) {
  //   const {
  //     body: { setor: paramsTipoContratacao },
  //     params: { id },
  //   } = req;

  //   const setor = await TipoContratacao.findByPk(id);

  //   if (!setor) throw new Error('TipoContratacao não encontrado');

  //   const data = {
  //     ...(paramsTipoContratacao ? { setor: paramsTipoContratacao } : {}),
  //   };

  //   setor.update(data);

  //   return res.json({ error: null, data: setor });
  // }

  // async destroy(req, res) {
  //   const {
  //     params: { id },
  //   } = req;

  //   const setor = await TipoContratacao.findByPk(id);

  //   if (!setor) throw new Error('TipoContratacao não encontrado');

  //   setor.destroy();

  //   return res.json({ error: null });
  // }
}

export default new TipoContratacaoController();
