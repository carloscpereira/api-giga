import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import moment from 'moment';

import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import Beneficiario from '../models/Sequelize/Beneficiario';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import AssociadoPF from '../models/Sequelize/AssociadoPF';
import AssociadoPJ from '../models/Sequelize/AssociadoPJ';
import AppError from '../errors/AppError';

export default class RemoveMembroContratoService {
  static async execute({ id_contrato, id_beneficiario, sequelize, transaction }) {
    let t = transaction;
    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new AppError(
        500,
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instanciação da conexãor'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }

    try {
      /**
       * Seleciono o Contrato e a Pessoa a ser removida do contrato
       */
      const [contrato, beneficiario] = await Promise.all([
        Contrato.findByPk(id_contrato, {
          include: [
            { model: PessoaFisica, as: 'responsavel_pessoafisica' },
            { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
          ],
          transaction: t,
        }),
        Beneficiario.findOne(
          {
            where: {
              [Op.or]: [
                { pessoabeneficiarioid: id_beneficiario, contratoid: id_contrato },
                { id: id_beneficiario, contratoid: id_contrato },
              ],
            },
          },
          { transaction: t }
        ),
      ]);

      if (!beneficiario) throw new AppError(404, 'Beneficiario não encontrado para o contrato informado');

      /**
       * Seleciono o Beneficiario e titulo
       */
      const titulo = await Titulo.findOne(
        {
          where: {
            numerocontratoid: contrato.id,
            dataperiodofinal: {
              [Op.gte]: new Date(),
            },
            dataperiodoinicial: {
              [Op.lt]: new Date(),
            },
            statusid: 1,
          },
        },
        { transaction: t }
      );

      /**
       * Se não houver titulos em aberto não há alterações a serem feitas
       */
      // if (!titulo) return;

      /**
       * Seleciono as parcelas não pagas daquele título
       */
      const ultimaParcelaQuitada = await sequelize.query(
        `SELECT * FROM parcela INNER JOIN titulo ON parcela.tituloid = titulo.id WHERE titulo.numerocontratoid = :id_contrato AND parcela.statusgrupoid = 2 ORDER BY parcela.id DESC LIMIT 1`,
        { type: QueryTypes.SELECT, replacements: { id_contrato }, plain: true, model: Parcela, transaction: t }
      );

      console.log(ultimaParcelaQuitada);
      // const dadosUltimaParcelaQuitada = await ultimaParcelaQuitada.getLotes();

      const diffUltimaParcela = moment(new Date()).diff(ultimaParcelaQuitada.datavencimento, 'days');

      if (diffUltimaParcela <= 20) {
        await beneficiario.update(
          { datadesativacao: moment(ultimaParcelaQuitada.datavencimento).add(1, 'month') },
          { transaction: t }
        );
        return;
      }

      if (!titulo) throw new AppError(401, 'Não há titulos em vigencia para contrado selecionado');

      const parcelasTitulo = await titulo.getParcelas({ transaction: t });

      const parcelasQuitadasTitulo = parcelasTitulo.filter((parcelas) => parcelas.statusgrupoid === 2);

      const dadosContrato =
        contrato.tipocontratoid === 5
          ? contrato.responsavel_pessoafisica[0].AssociadoPF
          : contrato.responsavel_pessoajuridica[0].AssociadoPJ;

      const qtdParcelasContrato = dadosContrato.qtdparcela;

      const newTituloCost =
        dadosContrato.valorcontrato -
        (beneficiario.valor - beneficiario.descontovalor) * (qtdParcelasContrato - parcelasQuitadasTitulo.length);
      const newContractCost =
        dadosContrato.valorcontrato - (beneficiario.valor - beneficiario.descontovalor) * qtdParcelasContrato;

      const beneficiariosContrato = await Beneficiario.findAll(
        {
          where: {
            contratoid: id_contrato,
            id: {
              [Op.ne]: beneficiario.id,
            },
            ativo: '1',
          },
        },
        { transaction: t }
      );

      const newContractMonthCost = beneficiariosContrato.reduce(
        (ant, { valor, descontovalor }) => ant + (valor - descontovalor || 0),
        0
      );

      /**
       * Desativando Beneficiario
       */
      await beneficiario.update({ ativo: '0', datadesativacao: new Date() }, { transaction: t });

      /**
       * Atualizando valor de Contrato
       */
      if (contrato.tipocontratoid === 5) {
        await AssociadoPF.update(
          {
            valorcontrato: newContractCost,
            valorliquido: newContractMonthCost,
            valormes: newContractMonthCost,
          },
          { transaction: t, where: { id: contrato.id } }
        );
      } else {
        await AssociadoPJ.update(
          {
            valorcontrato: newContractCost,
            valorliquido: newContractMonthCost,
            valormes: newContractMonthCost,
          },
          { transaction: t, where: { id: contrato.id } }
        );
      }

      /**
       * Atualizando valor do título
       */

      await titulo.update(
        {
          valor: newTituloCost,
        },
        { transaction: t }
      );

      await Parcela.update(
        {
          valor: newContractMonthCost,
          valorbruto: newContractMonthCost,
        },
        {
          where: {
            tituloid: titulo.id,
            statusgrupoid: 1,
            datavencimento: {
              [Op.gte]: new Date(),
            },
          },
          transaction: t,
        }
      );

      if (!transaction) await t.commit();

      return;
    } catch (error) {
      console.log(error);
      if (!transaction) await t.rollback();
      throw error;
    }
  }
}
