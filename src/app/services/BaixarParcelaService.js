/* eslint-disable no-nested-ternary */
import { Sequelize, Transaction, QueryTypes } from 'sequelize';
import moment from 'moment';

import Parcela from '../models/Sequelize/Parcela';
import FormaPagamento from '../models/Sequelize/FormaPagamento';
import Lote from '../models/Sequelize/LotePagamento';
import TipoBaixa from '../models/Sequelize/TipoBaixa';
import Pessoa from '../models/Sequelize/Pessoa';
import Contrato from '../models/Sequelize/Contrato';
import ParcelaDesconto from '../models/Sequelize/ParcelaAcrescimoDesconto';
import CMF from '../models/Sequelize/CentroMovimentacaoFinanceira';
import AtivarContratoService from './AtivarContratoService';
import Titulo from '../models/Sequelize/Titulo';
import AppError from '../errors/AppError';

export default class BaixarParcelaService {
    static async execute({
        id_parcela,
        id_lote,
        tipo_movimento = 'C',
        tipo_baixa = 4,
        data_pagamento,
        id_contrato,
        id_pessoa = 1,
        forma_pagamento,
        descontos,
        acrescimos,
        transaction,
        connection,
    }) {
        let t = transaction;

        if (!connection || !(connection instanceof Sequelize)) {
            throw new AppError(
                500,
                'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instancia da conexão'
            );
        }

        if (!transaction || !(transaction instanceof Transaction)) {
            t = await connection.transaction();
        }

        try {
            const [parcela, pessoaUsuario, checkLote] = await Promise.all([
                Parcela.findByPk(id_parcela, { transaction: t }),
                Pessoa.findByPk(id_pessoa, { transaction: t }),
                Lote.findByPk(id_lote, { transaction: t }),
            ]);
            let contrato = null;

            if (!id_contrato) {
                const titulo = await Titulo.findByPk(parcela.tituloid, { transaction: t });
                contrato = await Contrato.findByPk(titulo.numerocontratoid, { transaction: t });
            } else {
                contrato = await Contrato.findByPk(id_contrato, { transaction: t });
            }

            if (contrato && contrato.statusid === '62') {
                await AtivarContratoService({
                    id_contrato: contrato.id,
                    sequelize: connection,
                    transaction: t,
                    data_adesao: data_pagamento,
                });
            }

            const getLoteParcela = await parcela.getLotes({ transaction: t });
            let tipoBaixa;

            const parcelaLote = getLoteParcela ? getLoteParcela.shift() : null;

            const formaPagamento = Array.isArray(forma_pagamento) ? forma_pagamento : [forma_pagamento];
            const descontosPagamento = descontos ? (Array.isArray(descontos) ? descontos : [descontos]) : [];
            const acrescimosPagamento = acrescimos ? (Array.isArray(acrescimos) ? acrescimos : [acrescimos]) : [];

            if (checkLote && checkLote.statusid !== 1) {
                throw new AppError(409, 'It is not possible to change a batch that has already been finalized');
            }

            if (!parcela) {
                throw new AppError(404, 'Parcela not found');
            }

            if (parcela && parseInt(parcela.statusgrupoid, 10) === 2) {
                throw new AppError(201, 'Parcela já baixada');
            }

            if (!id_pessoa || !pessoaUsuario) {
                throw new AppError(400, 'Usuário informado não encontrado no sistema');
            }

            if (tipo_movimento !== 'C' && tipo_movimento !== 'D' && !tipo_movimento) {
                throw new AppError(400, 'Tipo de movimento informado é inválido');
            }

            // Verifica e pega o tipo de baixa
            if (Number.isInteger(Math.abs(tipo_baixa))) {
                tipoBaixa = await TipoBaixa.findByPk(tipo_baixa, { transaction: t });
            } else if (tipo_baixa) {
                tipoBaixa = await connection.query(
                    `SELECT * FROM tipobaixa WHERE unaccent(descricao) ILIKE unaccent(%${tipo_baixa}%)`, {
                        type: QueryTypes.SELECT,
                        plain: true,
                        model: TipoBaixa,
                        transaction: t,
                    }
                );
            }

            if (!tipo_baixa || !tipoBaixa) {
                throw new AppError(400, 'É necessário informar um tipo de Baixa correto');
            }

            const lote =
                checkLote ||
                parcelaLote ||
                (await Lote.create({
                    statusid: 1,
                    datacadastro: moment(new Date()).format(),
                    pessoausuarioid: pessoaUsuario.id,
                    lop_id_pessoa: pessoaUsuario.id,
                    lop_id_tipo_baixa: tipoBaixa.id,
                    lop_in_tipo_movimento: tipo_movimento,
                    // eslint-disable-next-line spaced-comment
                    // ...(contrato ? { lop_id_contrato: contrato.id } : {}),
                    lop_in_cobranca: false,
                }, { transaction: t }));

            if (!parcelaLote) {
                await parcela.setLotes(lote, {
                    through: { pal_dt_pagamento: moment(data_pagamento, 'YYYY-MM-DD').format() },
                    transaction: t,
                });
            }

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
                    ...(CartaoCredito && CartaoCredito.Numero ? { numerocartao: CartaoCredito.Numero } : {}),
                    ...(CartaoCredito && CartaoCredito.Validade ?
                        {
                            validadecartao: moment(CartaoCredito.Validade, 'mm/YYYY').format(),
                        } :
                        {}),
                    ...(CartaoCredito && CartaoCredito.TipoCartaoId ? { tipocartaoid: CartaoCredito.TipoCartaoId } : {}),
                    ...(CartaoCredito && CartaoCredito.CodigoSeguranca ?
                        { codigosegurancacartao: CartaoCredito.CodigoSeguranca } :
                        {}),
                    ...(Consignado && Consignado.Documento ? { numerodocumento: Consignado.Documento } : {}),
                    ...(Consignado && Consignado.Matricula ? { numeromatricula: Consignado.Matricula } : {}),
                    ...(Boleto && Boleto.Numero ? { numeroboleto: Boleto.Numero } : {}),
                    ...(Cheque && Cheque.Emitente ? { nome_emitente: Cheque.Emitente } : {}),
                    ...(Cheque && Cheque.Conta ? { contacheque: Cheque.Conta } : {}),
                    ...(Cheque && Cheque.Numero ? { numerocheque: Cheque.Numero } : {}),
                    ...(Cheque && Cheque.ChequeId ? { che_id_cheque: Cheque.ChequeId } : {}),
                    ...(Transferencia && Transferencia.ContaId ? { contaid: Transferencia.ContaId } : {}),
                    ...(Transferencia && Transferencia.AgenciaId ? { agenciaid: Transferencia.AgenciaId } : {}),
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

            const somaAcrescimos = acrescimosPagamento
                .map(({ Valor }) => parseFloat(Valor))
                .reduce((ant, prox) => ant + prox, 0);
            const somaDescontos = descontosPagamento
                .map(({ Valor }) => parseFloat(Valor))
                .reduce((ant, prox) => ant + prox, 0);

            const valorTotal = dataFormaPagamento.map(({ valor }) => valor).reduce((ant, prox) => ant + parseFloat(prox), 0);

            let ordem = 1;

            if (valorTotal !== parcela.valor) {
                const diffValorBruto = parcela.valor_bruto - (valorTotal - somaAcrescimos + somaDescontos);

                await ParcelaDesconto.destroy({ where: { parcelaid: parcela.id }, transaction: t });

                if (diffValorBruto < 0) {
                    await ParcelaDesconto.create({
                        cmfid: 180,
                        parcelaid: parcela.id,
                        valor: Math.abs(diffValorBruto),
                        porcent: (Math.abs(diffValorBruto) / parcela.valor_bruto) * 100,
                        tipomovimento: 'C',
                        dataaplicacao: moment().format(),
                        pessoausuarioid: pessoaUsuario.id,
                        tipoincidenciasigla: 'B',
                        // eslint-disable-next-line no-plusplus
                        ordem: ordem++,
                    }, { transaction: t });
                } else if (diffValorBruto > 0) {
                    await ParcelaDesconto.create({
                        cmfid: 10,
                        parcelaid: parcela.id,
                        valor: Math.abs(diffValorBruto),
                        porcent: (Math.abs(diffValorBruto) / parcela.valor_bruto) * 100,
                        tipomovimento: 'C',
                        dataaplicacao: moment().format(),
                        pessoausuarioid: pessoaUsuario.id,
                        tipoincidenciasigla: 'B',
                        // eslint-disable-next-line no-plusplus
                        ordem: ordem++,
                    }, { transaction: t });
                }

                if (descontosPagamento.length) {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const desconto of descontosPagamento) {
                        const cmfid = await CMF.findByPk(desconto.CMFID, { transaction: t });

                        if (!cmfid) {
                            throw new AppError(404, 'Não foi possível localizar o Centro de Movimentacao Financeiro espeficado');
                        }

                        await ParcelaDesconto.create({
                            cmfid: cmfid.id,
                            parcelaid: parcela.id,
                            valor: Math.abs(desconto.Valor),
                            porcent: (Math.abs(desconto.Valor) / parcela.valor_bruto) * 100,
                            tipomovimento: 'C',
                            dataaplicacao: moment().format(),
                            pessoausuarioid: pessoaUsuario.id,
                            tipoincidenciasigla: 'B',
                            // eslint-disable-next-line no-plusplus
                            ordem: ordem++,
                        }, { transaction: t });
                    }
                }

                if (acrescimosPagamento.length) {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const acrescimo of acrescimosPagamento) {
                        const cmfid = await CMF.findByPk(acrescimo.CMFID, { transaction: t });

                        if (!cmfid) {
                            throw new AppError(404, 'Não foi possível localizar o Centro de Movimentacao Financeiro espeficado');
                        }

                        await ParcelaDesconto.create({
                            cmfid: cmfid.id,
                            parcelaid: parcela.id,
                            valor: Math.abs(acrescimo.Valor),
                            porcent: (Math.abs(acrescimo.Valor) / parcela.valor_bruto) * 100,
                            tipomovimento: 'C',
                            dataaplicacao: moment().format(),
                            pessoausuarioid: pessoaUsuario.id,
                            tipoincidenciasigla: 'B',
                            // eslint-disable-next-line no-plusplus
                            ordem: ordem++,
                        }, { transaction: t });
                    }
                }

                await parcela.update({ valor: valorTotal }, { transaction: t });
            }

            await FormaPagamento.destroy({ where: { parcelaid: parcela.id }, transaction: t });

            // eslint-disable-next-line no-restricted-syntax
            for (const data of dataFormaPagamento) {
                await FormaPagamento.create(data, { transaction: t });
            }

            await parcela.update({ statusgrupoid: 2 }, { transaction: t });
            await lote.update({ lop_dt_baixa: moment().format(), statusid: 2 }, { transaction: t });

            if (!transaction) await t.commit();

            return lote;
        } catch (error) {
            if (!transaction) await t.rollback();
            throw error;
        }
    }
}