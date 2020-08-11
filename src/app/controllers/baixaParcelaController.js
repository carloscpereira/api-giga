/* eslint-disable no-unused-vars */
import moment from 'moment';

import Parcela from '../models/Sequelize/Parcela';
import Lote from '../models/Sequelize/LotePagamento';
import ParcelaDesconto from '../models/Sequelize/ParcelaAcrescimoDesconto';
import FormaPagamento from '../models/Sequelize/FormaPagamento';
import ParcelaLote from '../models/Sequelize/ParcelaLote';

class BaixaParcela {
  async store(req, res) {
    try {
      const {
        body: {
          LoteId,
          TipoBaixa,
          PessoaId,
          TipoMovimento,
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
            message:
              'It is not possible to change a batch that has already been finalized',
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

      if (
        parcela &&
        parseInt(parcela.statusgrupoid, 10) !== 1 &&
        parseInt(parcela.statusgrupoid, 10) !== 55
      ) {
        return res.status(403).json({
          error: 403,
          data: {
            message:
              'Portion cannot be invoiced because it has already been invoiced',
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

      await parcela.setLotes(lote, {
        through: { pal_dt_pagamento: moment(new Date()).format() },
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
                validadecartao: moment(
                  CartaoCredito.Validade,
                  'mm/YYYY'
                ).format(),
              }
            : {}),
          ...(CartaoCredito
            ? { tipocartaoid: CartaoCredito.TipoCartaoId }
            : {}),
          ...(CartaoCredito
            ? { codigosegurancacartao: CartaoCredito.CodigoSeguranca }
            : {}),
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

      const valorTotal = dataFormaPagamento
        .map(({ valor }) => valor)
        .reduce((ant, prox) => ant + prox, 0);

      if (valorTotal !== parcela.valor) {
        const diffValor = parcela.valor_bruto - valorTotal;
        // debug
        // await ParcelaDesconto.destroy({ where: { parcelaid: parcela.id } });

        if (diffValor < 0) {
          await ParcelaDesconto.create({
            cmfid: 63,
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
            cmfid: 62,
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

      parcela.update({ statusgrupoid: 2 });
      lote.update({ lop_dt_baixa: moment(new Date()).format(), statusid: 2 });

      return res.json(lote);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new BaixaParcela();
