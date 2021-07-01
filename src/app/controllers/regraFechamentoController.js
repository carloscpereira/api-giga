import { Op } from 'sequelize';

import RegraFechamento from '../models/Sequelize/RegraFechamento';

class RegraFechamentoController {
  async index(req, res) {
    const { page = 1, limit = 20, tiposcontrato_id, centrocusto_id, tipodecarteira_id } = req.query;

    const regrasFechamentoCentroCusto = await RegraFechamento.findAll({
      where: {
        tiposcontrato_id,
        tipodecarteira_id,
        centrocusto_id,
      },
    });

    let regrasFechamento = [];

    if (regrasFechamentoCentroCusto.length) {
      regrasFechamento = regrasFechamentoCentroCusto;
    } else {
      const regrasFechamentoCarteira = await RegraFechamento.findAll({
        where: {
          tiposcontrato_id,
          tipodecarteira_id,
        },
      });

      if (regrasFechamentoCarteira.length) {
        regrasFechamento = regrasFechamentoCarteira;
      } else {
        const regraFechamentoContrato = await RegraFechamento.findAll({
          where: {
            tiposcontrato_id,
          },
        });

        regrasFechamento = regraFechamentoContrato;
      }
    }

    return res.json({ error: null, data: regrasFechamento });

    // const checkFilter = !!(tiposcontrato_id || centrocusto_id || tiposcontrato_id);

    // const regrasFechamento = await RegraFechamento.findAll({
    //   limit,
    //   offset: (page - 1) * limit,
    //   where: {
    //     [Op.and]: [
    //       ...(tiposcontrato_id ? [{ [Op.or]: [{ tiposcontrato_id }, { tiposcontrato_id: { [Op.is]: null } }] }] : []),
    //       ...(centrocusto_id ? [{ [Op.or]: [{ centrocusto_id }, { centrocusto_id: { [Op.is]: null } }] }] : []),
    //       ...(tipodecarteira_id
    //         ? [{ [Op.or]: [{ tipodecarteira_id }, { tipodecarteira_id: { [Op.is]: null } }] }]
    //         : []),
    //     ],
    //   },
    // });
    // return res.json({ error: null, data: regrasFechamento });
  }

  async show(req, res) {
    const { id } = req.params;

    const regraFechamento = await RegraFechamento.findByPk(id);

    return res.json({ error: null, data: regraFechamento });
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

export default new RegraFechamentoController();
