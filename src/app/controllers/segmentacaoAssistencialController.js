import queryStringConverter from 'sequelize-querystring-converter';

import SegmentacaoAssistencial from '../models/Sequelize/SegmentacaoAssistencial';

class SegmentacaoAssistencialController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    console.log(criteria);

    const segmentacaoAssistencial = await SegmentacaoAssistencial.findAll(criteria);
    return res.json({ error: null, data: segmentacaoAssistencial });
  }

  async show(req, res) {
    const { id } = req.params;

    const segmentacaoAssistencial = await SegmentacaoAssistencial.findByPk(id);

    return res.json({ error: null, data: segmentacaoAssistencial });
  }

  // async create(req, res) {
  //   const { setor: paramasSetor = null } = req.body;

  //   if (!paramasSetor) throw new Error('Informe o Setor que deseja criar');

  //   const setor = await Setor.create({ setor: paramasSetor });

  //   return res.json({ error: null, data: setor });
  // }

  // async update(req, res) {
  //   const {
  //     body: { setor: paramsSetor },
  //     params: { id },
  //   } = req;

  //   const setor = await Setor.findByPk(id);

  //   if (!setor) throw new Error('Setor não encontrado');

  //   const data = {
  //     ...(paramsSetor ? { setor: paramsSetor } : {}),
  //   };

  //   setor.update(data);

  //   return res.json({ error: null, data: setor });
  // }

  // async destroy(req, res) {
  //   const {
  //     params: { id },
  //   } = req;

  //   const setor = await Setor.findByPk(id);

  //   if (!setor) throw new Error('Setor não encontrado');

  //   setor.destroy();

  //   return res.json({ error: null });
  // }
}

export default new SegmentacaoAssistencialController();
