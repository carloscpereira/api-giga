/* eslint-disable no-restricted-syntax */
import { Op, Sequelize, Transaction } from 'sequelize';
import { parseISO, add } from 'date-fns';

import axios from 'axios';
import Contrato from '../models/Sequelize/Contrato';
import Beneficiario from '../models/Sequelize/Beneficiario';
import TipoOcorrencia from '../models/Sequelize/TipoOcorrencia';
import RegraVigenciaContrato from '../models/Sequelize/RegraVigenciaContrato';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import CancelarContratoService from './CancelarContratoService';
import RemoveMembroContratoService from './RemoveMembroContratoService';
import AppError from '../errors/AppError';

export default async ({ id_contrato, data_adesao = new Date(), sequelize, transaction }) => {
  let t = transaction;

  if (!sequelize || !(sequelize instanceof Sequelize)) {
    throw new AppError(
      500,
      'Não foi possível estabelecer uma conexão com o banco de dados, certifique que houve a inilialização do mesmo.'
    );
  }

  if (!transaction || !(transaction instanceof Transaction)) {
    t = await sequelize.transaction();
  }

  if (!(t instanceof Transaction)) {
    throw new AppError(500, 'Erro ao criar transaction');
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

    await contrato.update(
      { dataadesao: dataAdesao, datainicialvigencia: dataAdesao, datafinalvigencia: dataFinalVigencia, statusid: 8 },
      { transaction: t }
    );

    if (!contrato.contrato_parent) {
      // Criação de novo contrato
      await Beneficiario.update(
        {
          dataadesao: dataAdesao,
          ativo: 1,
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
    } else {
      // Contrato Migração
      const [contratoParent, beneficiariosContratoParent, beneficiariosContrato] = await Promise.all([
        Contrato.findByPk(contrato.contrato_parent, { transaction: t }),
        Beneficiario.findAll({
          where: {
            contratoid: contrato.contrato_parent,
            ativo: 1,
          },
          include: [{ model: PessoaFisica, as: 'dados' }],
          transaction: t,
        }),
        Beneficiario.findAll({
          where: {
            contratoid: contrato.id,
          },
          include: [{ model: PessoaFisica, as: 'dados' }],
          transaction: t,
        }),
      ]);

      const diferencaBeneficiarios = beneficiariosContratoParent.filter(
        ({ dados: { cpf } }) =>
          !beneficiariosContrato.map(({ dados: { cpf: beneficiarioCpf } }) => beneficiarioCpf).includes(cpf)
      );

      const intersecaoBeneficiarios = beneficiariosContratoParent.filter(({ dados: { cpf } }) =>
        beneficiariosContrato.map(({ dados: { cpf: beneficiarioCpf } }) => beneficiarioCpf).includes(cpf)
      );

      if (!intersecaoBeneficiarios) {
        throw new AppError(500, 'Erro ao tentar migrar contrato');
      }

      if (!diferencaBeneficiarios) {
        await CancelarContratoService.execute({ id: contratoParent.id, sequelize, transaction: t });
      } else {
        for (const beneficiario of intersecaoBeneficiarios) {
          await RemoveMembroContratoService.execute({
            id_beneficiario: beneficiario.id,
            id_contrato: contratoParent.id,
            sequelize,
            transaction: t,
          });
        }
      }

      await beneficiariosContrato.update({ ativo: 1 }, { transaction: t });
    }

    await axios.put(`https://www.idental.com.br/api/corretor/propostas/vendas/ativar/contrato/${contrato.id}`, {
      dataAtivacao: dataAdesao,
    });

    if (!transaction) await t.commit();

    return;
  } catch (error) {
    console.log(error);

    if (!transaction) await t.rollback();
    throw error;
  }
};
