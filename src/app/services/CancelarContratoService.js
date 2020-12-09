import { Op } from 'sequelize';

import Contrato from '../models/Sequelize/Contrato';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import Beneficiario from '../models/Sequelize/Beneficiario';

export default class CancelarContratoService {
  static async execute({ id, sequelize, transaction, motivocancelamentoid = 38 }) {
    const t = transaction || (await sequelize.transaction());

    try {
      // Seleciona o contrato a ser cancelado
      const contrato = await Contrato.findByPk(id, {
        include: [
          {
            model: GrupoFamiliar,
            as: 'gruposfamiliar',
          },
          {
            model: Titulo,
            as: 'titulos',
          },
        ],
      });

      // Caso o contrato não exista, retorna um erro
      if (!contrato) throw new Error('Impossível cancelar um contrato inexistente');

      // Atualiza o status do contrato para status de cancelado (7)
      await contrato.update(
        {
          statusid: '7',
          datacancelamento: new Date(),
          motivocancelamentoid,
        },
        { transaction: t }
      );

      const gruposContrato = contrato.gruposfamiliar; // Seleciona todos os grupos do contrato
      const titulosContrato = contrato.titulos; // Seleciona todos os títulos do contrato

      /**
       * Percorre todos os grupos familiares
       */
      // eslint-disable-next-line no-restricted-syntax
      for (const { grupo: grupofamiliarid } of gruposContrato) {
        // eslint-disable-next-line no-await-in-loop
        await Beneficiario.update({ ativo: '0' }, { where: { grupofamiliarid }, transaction: t }); // Desligando beneficiários do grupo, do contrato
      }

      /**
       * Percorre todos os título do contrato
       */
      // eslint-disable-next-line no-restricted-syntax
      for (const { id: tituloid } of titulosContrato) {
        /**
         * Cancelando parcelas não pagas, cuja data de vencimento seja maior ou igual a data de cancelamento do contrato.
         */
        // eslint-disable-next-line no-await-in-loop
        await Parcela.update(
          { statusgrupoid: 7 },
          { where: { tituloid, statusgrupoid: 1, datavencimento: { [Op.gte]: new Date() } }, transaction: t }
        );
      }

      // Submete alterações ao banco de dados
      t.commit();

      return true;
    } catch (error) {
      t.rollback();

      throw error;
    }
  }
}
