import moment from 'moment';

import Parcela from '../models/Sequelize/Parcela';
import Lote from '../models/Sequelize/LotePagamento';
// import ParcelaDesconto from '../models/Sequelize/ParcelaAcrescimoDesconto';
import FormaPagamento from '../models/Sequelize/FormaPagamento';
import BaixarParcelaService from '../services/BaixarParcelaService';

class BaixaParcela {
  async store(req, res) {
    const {
      body: {
        LoteId,
        TipoBaixa,
        PessoaId,
        TipoMovimento,
        DataPagamento = moment(new Date()).format(),
        ContratoId,
        Descontos,
        Acrescimos,
        FormaPagamento: formaPagamento,
      },
      sequelize,
      params: { id },
    } = req;
    const transaction = await sequelize.transaction();

    try {
      const baixaParcela = await BaixarParcelaService.execute({
        id_lote: LoteId,
        id_parcela: id,
        tipo_movimento: TipoMovimento || 'C',
        tipo_baixa: TipoBaixa || 4,
        data_pagamento: DataPagamento,
        id_contrato: ContratoId,
        id_pessoa: PessoaId || 1,
        forma_pagamento: formaPagamento,
        descontos: Descontos,
        acrescimos: Acrescimos,
        connection: sequelize,
        transaction,
      });

      await transaction.commit();

      return res.json(baixaParcela);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async destroy(req, res) {
    const {
      sequelize,
      params: { id },
    } = req;

    try {
      const parcela = await Parcela.findByPk(id);

      if (parseInt(parcela.statusgrupoid, 10) !== 2) {
        return res.status(400).json({
          error: 400,
          data: { message: 'Installment not settled' },
        });
      }

      const lotes = await parcela.getLotes();

      if (lotes.length === 0) {
        await parcela.update({ statusgrupoid: 1, valor: parcela.valor_bruto });

        return res.json({ error: null, data: parcela });
      }

      const firtLote = lotes.shift();
      const loteParcelas = await firtLote.getParcelas();

      sequelize.query('ALTER TABLE parcelalote DISABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote DISABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela DISABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento DISABLE TRIGGER triu_lotepagamento');
      sequelize.query('ALTER TABLE formapagamento DISABLE TRIGGER trd_formapagamento');

      if (loteParcelas.length > 1) {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id } });
        await parcela.removeLotes([firtLote.id]);
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null, valor: parcela.valor_bruto });
      } else {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id } });
        await parcela.removeLotes([firtLote.id]);
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null, valor: parcela.valor_bruto });
        await Lote.destroy({ where: { id: firtLote.id } });
      }

      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento');
      sequelize.query('ALTER TABLE formapagamento ENABLE TRIGGER trd_formapagamento');

      return res.json({ error: null, data: parcela });
    } catch (error) {
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento');
      return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new BaixaParcela();
