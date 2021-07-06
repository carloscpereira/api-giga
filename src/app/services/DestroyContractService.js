import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import Contrato from '../models/Sequelize/Contrato';

export default class DestroyContractService {
  static async execute({ transaction, connection, id_contrato }) {
    let t = transaction;

    if (!connection || !(connection instanceof Sequelize)) {
      throw new Error(
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instancia da conexão'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await connection.transaction();
    }

    try {
      const contrato = await Contrato.findByPk(id_contrato, { transaction: t });

      if (!contrato) {
        throw new Error('Contrato não encontrado');
      }

      /**
       * Excluindo Pagamentos
       */

      // Desabilitando Triggers
      await connection.query('ALTER TABLE parcelalote DISABLE TRIGGER trd_parcelalote', { transaction: t });
      await connection.query('ALTER TABLE parcelalote DISABLE TRIGGER triu_parcelalote', { transaction: t });
      await connection.query('ALTER TABLE parcela DISABLE TRIGGER triu_parcela', { transaction: t });
      await connection.query('ALTER TABLE lotepagamento DISABLE TRIGGER triu_lotepagamento', { transaction: t });
      await connection.query('ALTER TABLE formapagamento DISABLE TRIGGER trd_formapagamento', { transaction: t });
      await connection.query('ALTER TABLE cn_ocorrenciacontrato DISABLE TRIGGER tri_cnocorrenciacontrato', {
        transaction: t,
      });
      await connection.query('ALTER TABLE cn_ocorrenciacontrato DISABLE TRIGGER trud_cnocorrenciacontrato', {
        transaction: t,
      });

      // Deletando parcelas e forma pagamento de parcelas
      await connection.query(
        'DELETE FROM formapagamento WHERE parcelaid in (SELECT parcela.id FROM parcela INNER JOIN titulo t on parcela.tituloid = t.id WHERE t.numerocontratoid = :contrato)',
        { transaction: t, type: QueryTypes.DELETE, replacements: { contrato: contrato.id } }
      );
      await connection.query('DELETE FROM lotepagamento l WHERE l.lop_id_contrato = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query(
        'DELETE FROM parcelalote p WHERE p.parcelaid in (SELECT parcela.id FROM parcela INNER JOIN titulo t on parcela.tituloid = t.id WHERE t.numerocontratoid = :contrato)',
        { transaction: t, type: QueryTypes.DELETE, replacements: { contrato: contrato.id } }
      );
      await connection.query(
        'DELETE FROM cn_ocorrenciadestinatario od WHERE od.ocorrenciacontratoid IN (SELECT id FROM cn_ocorrenciacontrato o WHERE numerocontratoid = :contrato)',
        { transaction: t, type: QueryTypes.DELETE, replacements: { contrato: contrato.id } }
      );
      await connection.query('DELETE FROM cn_ocorrenciacontrato o WHERE numerocontratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query(
        'DELETE FROM sys_log_contato WHERE parcela_id in (SELECT id FROM parcela p WHERE p.tituloid = (SELECT titulo.id FROM titulo WHERE numerocontratoid = :contrato))',
        {
          transaction: t,
          type: QueryTypes.DELETE,
          replacements: { contrato: contrato.id },
        }
      );
      await connection.query(
        'DELETE  FROM parcela p WHERE p.tituloid = (SELECT titulo.id FROM titulo WHERE numerocontratoid = :contrato)',
        { transaction: t, type: QueryTypes.DELETE, replacements: { contrato: contrato.id } }
      );
      await connection.query('DELETE FROM titulo WHERE numerocontratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });

      // Habilitanto Triggers
      await connection.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote', { transaction: t });
      await connection.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote', { transaction: t });
      await connection.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela', { transaction: t });
      await connection.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento', { transaction: t });
      await connection.query('ALTER TABLE formapagamento ENABLE TRIGGER trd_formapagamento', { transaction: t });
      await connection.query('ALTER TABLE cn_ocorrenciacontrato ENABLE TRIGGER tri_cnocorrenciacontrato', {
        transaction: t,
      });
      await connection.query('ALTER TABLE cn_ocorrenciacontrato ENABLE TRIGGER trud_cnocorrenciacontrato', {
        transaction: t,
      });

      /**
       * Deletando contrato e beneficiários
       */
      await connection.query('DELETE FROM cn_historico_beneficiario WHERE contratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query(
        'DELETE FROM cn_requerimento WHERE id_beneficiario IN (SELECT id FROM cn_beneficiario WHERE contratoid = :contrato)',
        {
          transaction: t,
          type: QueryTypes.DELETE,
          replacements: { contrato: contrato.id },
        }
      );
      await connection.query('DELETE FROM cn_beneficiario WHERE contratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query('DELETE FROM cn_grupofamiliar WHERE contratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query(
        'DELETE FROM cn_historico_associadopf where cn_historico_associadopf.associadopfid = :contrato',
        { transaction: t, type: QueryTypes.DELETE, replacements: { contrato: contrato.id } }
      );
      await connection.query('DELETE FROM cn_associadopf WHERE id = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query('DELETE FROM cn_historico_contrato WHERE contratoid = :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });
      await connection.query('DELETE FROM cn_contrato WHERE id= :contrato', {
        transaction: t,
        type: QueryTypes.DELETE,
        replacements: { contrato: contrato.id },
      });

      if (!transaction) await t.commit();

      return true;
    } catch (error) {
      if (!transaction) await t.rollback();

      throw error;
    }
  }
}
