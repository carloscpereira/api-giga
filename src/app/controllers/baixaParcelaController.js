import moment from 'moment';

import Parcela from '../models/Sequelize/Parcela';
import Lote from '../models/Sequelize/LotePagamento';
import ParcelaDesconto from '../models/Sequelize/ParcelaAcrescimoDesconto';
import FormaPagamento from '../models/Sequelize/FormaPagamento';

class BaixaParcela {
  async store(req, res) {
    try {
      const {
        body: {
          LoteId,
          TipoBaixa,
          PessoaId,
          TipoMovimento,
          DataPagamento = moment(new Date()).format(),
          ContratoId,
          FormaPagamento: formaPagamento,
        },
        params: { id },
      } = req;

      const checkLote = await Lote.findByPk(LoteId);
      const parcela = await Parcela.findByPk(id);
      const getLoteParcela = await parcela.getLotes();

      const parcelaLote = getLoteParcela ? getLoteParcela.shift() : null;

      if (checkLote && checkLote.statusid !== 1) {
        return res.status(403).json({
          error: 403,
          data: {
            message: 'It is not possible to change a batch that has already been finalized',
          },
        });
      }

      if (!parcela) {
        return res.status(404).json({
          error: 404,
          data: {
            message: 'Parcela not found',
          },
        });
      }

      if (parcela && parseInt(parcela.statusgrupoid, 10) !== 1 && parseInt(parcela.statusgrupoid, 10) !== 55) {
        return res.status(403).json({
          error: 403,
          data: {
            message: 'Portion cannot be invoiced because it has already been invoiced',
          },
        });
      }

      /**
       * Verifica se o lote existe e se é válido.
       * Caso exista e seja válido, o lote prosseguira
       * Caso o lote não exista, um novo lote será gerado
       */
      const lote =
        checkLote ||
        parcelaLote ||
        (await Lote.create({
          statusid: 1,
          datacadastro: moment(new Date()).format(),
          pessoausuarioid: PessoaId || 1,
          lop_id_pessoa: PessoaId || 1,
          lop_id_tipo_baixa: TipoBaixa || 4,
          lop_in_tipo_movimento: TipoMovimento || 'C',
          ...(ContratoId ? { lop_id_contrato: ContratoId } : {}),
          lop_in_cobranca: false,
        }));

      if (!parcelaLote)
        await parcela.setLotes(lote, {
          through: { pal_dt_pagamento: DataPagamento },
        });

      const dataFormaPagamento = formaPagamento.map(
        ({
          Carteira,
          Valor,
          CartaoCredito,
          Cheque,
          Boleto,
          Consignado,
          Transferencia,
          NumeroTransacao,
          PaymentId,
          Tid,
          Obs,
        }) => ({
          ...(CartaoCredito ? { numerocartao: CartaoCredito.Numero } : {}),
          ...(CartaoCredito
            ? {
                validadecartao: moment(CartaoCredito.Validade, 'mm/YYYY').format(),
              }
            : {}),
          ...(CartaoCredito ? { tipocartaoid: CartaoCredito.TipoCartaoId } : {}),
          ...(CartaoCredito ? { codigosegurancacartao: CartaoCredito.CodigoSeguranca } : {}),
          ...(Consignado ? { numerodocumento: Consignado.Documento } : {}),
          ...(Consignado ? { numeromatricula: Consignado.Matricula } : {}),
          ...(Boleto ? { numeroboleto: Boleto.Numero } : {}),
          ...(Cheque ? { nome_emitente: Cheque.Emitente } : {}),
          ...(Cheque ? { contacheque: Cheque.Conta } : {}),
          ...(Cheque ? { numerocheque: Cheque.Numero } : {}),
          ...(Cheque ? { che_id_cheque: Cheque.ChequeId } : {}),
          ...(Transferencia ? { contaid: Transferencia.ContaId } : {}),
          ...(Transferencia ? { agenciaid: Transferencia.AgenciaId } : {}),
          parcelaid: parcela.id,
          numerotransacao: NumeroTransacao,
          tipodecarteiraid: Carteira,
          obs: Obs,
          valor: Valor,
          fop_in_conciliado: true,
          fop_in_pre_conciliacao: false,
          paymentid: PaymentId,
          tid: Tid,
        })
      );

      const valorTotal = dataFormaPagamento.map(({ valor }) => valor).reduce((ant, prox) => ant + prox, 0);

      if (valorTotal !== parcela.valor) {
        const diffValor = parcela.valor_bruto - valorTotal;
        // debug
        // await ParcelaDesconto.destroy({ where: { parcelaid: parcela.id } });

        if (diffValor < 0) {
          await ParcelaDesconto.create({
            cmfid: 180,
            parcelaid: parcela.id,
            valor: diffValor * -1,
            porcent: ((diffValor * -1) / parcela.valor_bruto) * 100,
            tipomovimento: 'C',
            dataaplicacao: moment(new Date()).format(),
            pessoausuarioid: PessoaId || 1,
            tipoincidenciasigla: 'B',
            ordem: 1,
          });
        } else {
          await ParcelaDesconto.create({
            cmfid: 10,
            parcelaid: parcela.id,
            valor: diffValor,
            porcent: (diffValor / parcela.valor_bruto) * 100,
            tipomovimento: 'D',
            dataaplicacao: moment(new Date()).format(),
            pessoausuarioid: PessoaId || 1,
            tipoincidenciasigla: 'B',
            ordem: 1,
          });
        }

        await parcela.update({ valor: valorTotal });
      }

      // Cria a forma pagamento
      await FormaPagamento.destroy({ where: { parcelaid: parcela.id } });

      // eslint-disable-next-line no-restricted-syntax
      for (const data of dataFormaPagamento) {
        // eslint-disable-next-line no-await-in-loop
        await FormaPagamento.create(data);
      }

      await parcela.update({ statusgrupoid: 2 });
      await lote.update({
        lop_dt_baixa: moment(new Date()).format(),
        statusid: 2,
      });

      return res.json({
        error: null,
        data: await Lote.findByPk(lote.id, {
          include: [
            {
              model: Parcela,
              as: 'parcelas',
              through: {
                attributes: ['id', 'pal_dt_pagamento'],
              },
              include: [
                {
                  model: FormaPagamento,
                  as: 'pagamentos',
                },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
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
        await parcela.update({ statusgrupoid: 1 });

        return res.json({ error: null, data: parcela });
      }

      const firtLote = lotes.shift();
      const loteParcelas = await firtLote.getParcelas();
      // sequelize.query('BEGIN');

      sequelize.query('ALTER TABLE parcelalote DISABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote DISABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela DISABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento DISABLE TRIGGER triu_lotepagamento');
      sequelize.query('ALTER TABLE formapagamento DISABLE TRIGGER trd_formapagamento');

      if (loteParcelas.length > 1) {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id } });
        await parcela.removeLotes([firtLote.id]);
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null });
      } else {
        await FormaPagamento.destroy({ where: { parcelaid: parcela.id } });
        await parcela.removeLotes([firtLote.id]);
        await parcela.update({ statusgrupoid: 1, lop_dt_baixa: null });
        await Lote.destroy({ where: { id: firtLote.id } });
      }

      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento');
      sequelize.query('ALTER TABLE formapagamento ENABLE TRIGGER trd_formapagamento');

      // sequelize.query('COMMIT');

      return res.json({ error: null, data: parcela });
    } catch (error) {
      // sequelize.query('ROLLBACK');
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER trd_parcelalote');
      sequelize.query('ALTER TABLE parcelalote ENABLE TRIGGER triu_parcelalote');
      sequelize.query('ALTER TABLE parcela ENABLE TRIGGER triu_parcela');
      sequelize.query('ALTER TABLE lotepagamento ENABLE TRIGGER triu_lotepagamento');
      return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new BaixaParcela();
