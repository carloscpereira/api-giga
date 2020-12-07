import { Op, QueryTypes } from 'sequelize';
import moment from 'moment';

import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import Beneficiario from '../models/Sequelize/Beneficiario';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import AssociadoPF from '../models/Sequelize/AssociadoPF';
import AssociadoPJ from '../models/Sequelize/AssociadoPJ';

export default class RemoveMembroContratoService {
  static async execute({ id_contrato, id_beneficiario, sequelize, transaction }) {
    const t = transaction || (await sequelize.transaction());

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
        }),
        Beneficiario.findOne({ where: { id: id_beneficiario, contratoid: id_contrato } }),
      ]);

      if (!beneficiario) throw new Error('Beneficiario não encontrado para o contrato informado');

      /**
       * Seleciono o Beneficiario e titulo
       */
      const titulo = await Titulo.findOne({
        where: {
          numerocontratoid: contrato.id,
          datavencimento: {
            [Op.gte]: new Date(),
          },
          dataperiodoinicial: {
            [Op.lt]: new Date(),
          },
          statusid: 1,
        },
      });

      /**
       * Se não houver titulos em aberto não há alterações a serem feitas
       */
      // if (!titulo) return;

      /**
       * Seleciono as parcelas não pagas daquele título
       */
      const ultimaParcelaQuitada = await sequelize.query(
        `SELECT * FROM parcela INNER JOIN titulo ON parcela.tituloid = titulo.id WHERE titulo.numerocontratoid = :id_contrato AND parcela.statusgrupoid = 2 ORDER BY parcela.id DESC LIMIT 1`,
        { type: QueryTypes.SELECT, replacements: { id_contrato }, plain: true, model: Parcela }
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

      if (!titulo) throw new Error('Não há titulos em vigencia para contrado selecionado');

      const parcelasTitulo = await titulo.getParcelas();

      const parcelasQuitadasTitulo = parcelasTitulo.filter((parcelas) => parcelas.statusgrupoid === 2);

      const dadosContrato =
        contrato.tipocontratoid === 5
          ? contrato.responsavel_pessoafisica[0].AssociadoPF
          : contrato.responsavel_pessoajuridica[0].AssociadoPJ;

      const qtdParcelasContrato = dadosContrato.qtdparcela;

      const newTituloCost =
        dadosContrato.valorcontrato - beneficiario.valor * (parcelasQuitadasTitulo.length - qtdParcelasContrato);
      const newContractCost = dadosContrato.valorcontrato - beneficiario.valor * qtdParcelasContrato;

      const beneficiariosContrato = await Beneficiario.findAll({
        where: {
          contratoid: id_contrato,
          id: {
            [Op.ne]: beneficiario.id,
          },
          ativo: 1,
        },
      });

      const newContractMonthCost = beneficiariosContrato.reduce((ant, { valor }) => ant + (valor || 0), 0);

      /**
       * Desativando Beneficiario
       */
      await beneficiario.update({ ativo: 0, datadesativacao: new Date() }, { transaction: t });

      /**
       * Atualizando valor de Contrato
       */
      if (contrato.tipocontratoid === 5) {
        await AssociadoPF.update(
          {
            valorcontrato: newContractCost,
            valorliquido: newContractCost,
            valormes: newContractMonthCost,
          },
          { transaction: t, where: { id: contrato.id } }
        );
      } else {
        await AssociadoPJ.update(
          {
            valorcontrato: newContractCost,
            valorliquido: newContractCost,
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

      if (transaction) return;

      t.commit();

      return;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }
}
