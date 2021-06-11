import { Op, Sequelize, Transaction } from 'sequelize';
import { parseISO, add } from 'date-fns';

import Contrato from '../models/Sequelize/Contrato';
import Beneficiario from '../models/Sequelize/Beneficiario';
import TipoOcorrencia from '../models/Sequelize/TipoOcorrencia';
import RegraVigenciaContrato from '../models/Sequelize/RegraVigenciaContrato';

export default async ({ id_contrato, data_adesao = new Date(), sequelize, transaction }) => {
  let t = transaction;

  if (!sequelize || !(sequelize instanceof Sequelize)) {
    throw new Error(
      'Não foi possível estabelecer uma conexão com o banco de dados, certifique que houve a inilialização do mesmo.'
    );
  }

  if (!transaction || !(transaction instanceof Transaction)) {
    t = await sequelize.transaction();
  }

  if (!(t instanceof Transaction)) {
    throw new Error('Erro ao criar transaction');
  }

  try {
    const idContrato = typeof id_contrato === 'number' ? id_contrato : parseInt(id_contrato, 10);

    const [contrato, tipoOcorrencia] = await Promise.all([
      Contrato.findOne({
        where: {
          id: idContrato,
          statusid: 62,
        },
        transaction: t,
      }),
      TipoOcorrencia.findOne({ where: { codigo_plano: '1' }, transaction: t }),
    ]);

    // if (!contrato) throw new Error('Contrato não encontrato');

    if (!contrato) return;

    const regraVigencia = await RegraVigenciaContrato.findByPk(contrato.con_id_regra_vigencia, { transaction: t });

    const dataAdesao = data_adesao instanceof Date ? data_adesao : parseISO(data_adesao);
    const dataFinalVigencia = add(dataAdesao, { months: regraVigencia.mesesvigencia || 24 });

    await Beneficiario.update(
      {
        dataadesao: dataAdesao,
      },
      {
        transaction: t,
        where: {
          contratoid: contrato.id,
          motivoadesaoid: {
            [Op.not]: tipoOcorrencia.id,
          },
        },
      }
    );

    await contrato.update(
      { dataadesao: dataAdesao, datainicialvigencia: dataAdesao, datafinalvigencia: dataFinalVigencia },
      { transaction: t }
    );

    if (!transaction) await t.rollback();

    return;
  } catch (error) {
    console.log(error);

    if (!transaction) await t.rollback();
    throw error;
  }
};
