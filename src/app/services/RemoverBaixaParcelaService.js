import { Sequelize, Transaction } from 'sequelize';

import Parcela from '../models/Sequelize/Parcela';
import FormaPagamento from '../models/Sequelize/FormaPagamento';
import Lote from '../models/Sequelize/LotePagamento';

export default class RemoverBaixaParcelaService {
  static async execute({ id_parcela, transaction, connection }) {
    let t = transaction;
    if (!connection || !(connection instanceof Sequelize)) {
      throw new Error(
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instanciação da conexãor'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await connection.transaction();
    }

    try {
      const parcela = await Parcela.findByPk(id_parcela, { transaction: t });

      if (parseInt(parcela.statusgrupoid, 10) !== 1) {
        throw new Error('Installment not settled');
      }

      const lotes = await parcela.getLotes({ transaction: t });

      if (lotes.length === 0) {
        await parcela.update({ statusgrupoid: 1, valor: parcela.valor_bruto }, { transaction: t });

        return parcela;
      }

      const firstLote = lotes.shift();
      const loteParcelas = await firstLote.getParcelas({ transaction: t });

      connection.query('ALTER TABLE parcelalote DISABLE TRIGGER trd_parcelalote', { transaction: t });
      connection.query('ALTER TABLE parcelalote DISABLE TRIGGER triu_parcelalote', { transaction: t });
      connection.query('ALTER TABLE parcela DISABLE TRIGGER triu_parcela', { transaction: t });
      connection.query('ALTER TABLE lotepagamento DISABLE TRIGGER triu_lotepagamento', { transaction: t });
      connection.query('ALTER TABLE formapagamento DISABLE TRIGGER trd_formapagamento', { transaction: t });

      if (loteParcelas.length > 1) {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id }, transaction: t });
        await parcela.removeLotes([firstLote.id], { transaction: t });
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null, valor: parcela.valor_bruto }, { transaction: t });
      } else {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id }, transaction: t });
        await parcela.removeLotes([firstLote.id], { transaction: t });
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null, valor: parcela.valor_bruto }, { transaction: t });
        await Lote.destroy({ where: { id: firstLote.id }, transaction: t });
      }

      connection.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote', { transaction: t });
      connection.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote', { transaction: t });
      connection.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela', { transaction: t });
      connection.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento', { transaction: t });
      connection.query('ALTER TABLE formapagamento ENABLE TRIGGER trd_formapagamento', { transaction: t });

      if (!transaction) t.commit();

      return parcela;
    } catch (error) {
      if (!transaction) t.rollback();
      return error;
    }
  }
}
