/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import * as Yup from 'yup';
import { Op, QueryTypes } from 'sequelize';
import _ from 'lodash';

import queryStringConverter from 'sequelize-querystring-converter';
import Contrato from '../models/Sequelize/Contrato';
import TipoContrato from '../models/Sequelize/TipoContrato';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import TipoTabelaUso from '../models/Sequelize/TipoTabelaUso';
import TipoOcorrencia from '../models/Sequelize/TipoOcorrencia';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import Status from '../models/Sequelize/Status';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

import CriarContratoService from '../services/CriarContratoService';
import MigrarContratoService from '../services/MigrarContratoService';

import RemoveMembroContratoService from '../services/RemoveMembroContratoService';
import AdicionarMembroContratoService from '../services/AdicionarMembroContratoService';
import AtivarContratoService from '../services/AtivarContratoService';
import DestroyContractService from '../services/DestroyContractService';
import AppError from '../errors/AppError';

class ContratoController {
    async index(req, res) {
        const { limit = 20, page = 1, cpf, nome, ...querya } = req.query;
        const offset = (page - 1) * limit;

        const criteria = queryStringConverter.convert({ query: querya });
        // const cpfCriteria = queryStringConverter.convert({ query: { ...((cpf && { cpf }) || {}) } });

        // const { where: whereCriteria, ...parameterCriteria } = cpfCriteria;
        // const { codigo, ...allWhere } = whereCriteria || {};
        // console.log({
        //   where: {
        //     ...allWhere,
        //     ...(codigo
        //       ? {
        //           codigo: {
        //             [Op.iLike]: `%${codigo}%`,
        //           },
        //         }
        //       : {}),
        //   },
        // });

        // console.log(cpfCriteria);

        const contratos = await Contrato.findAll({
            ...criteria,
            limit,
            offset,
            attributes: { exclude: ['infoStatus'] },
            include: [
                { model: PessoaJuridica, as: 'operadora', attributes: ['id', 'nomefantasia', 'razaosocial', 'cnpj'] },
                {
                    model: PessoaFisica,
                    as: 'responsavel_pessoafisica',
                    where: {
                        ...(cpf ?
                            {
                                cpf: {
                                    [Op.iLike]: `${cpf}%`,
                                },
                            } :
                            {}),
                        ...(nome ?
                            {
                                nome: {
                                    [Op.iLike]: `%${nome}%`,
                                },
                            } :
                            {}),
                    },
                },
                { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
                { model: Status, as: 'infoStatus', attributes: ['descricao'] },
                { model: TipoCarteira, as: 'infoCarteira', attributes: ['descricao'] },
                { model: TipoContrato, as: 'infoContrato', attributes: ['descricao'] },
                { model: TipoTabelaUso, as: 'infoTabelaUso', attributes: ['descricao'] },
                { model: TipoOcorrencia, as: 'infoAdesao', attributes: ['descricao'] },
                { model: TipoOcorrencia, as: 'infoCancelamento', attributes: ['descricao'] },
                {
                    model: GrupoFamiliar,
                    as: 'gruposfamiliar',
                    include: [{
                            model: PessoaFisica,
                            as: 'beneficiarios',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },

                        {
                            model: PessoaFisica,
                            as: 'responsaveis',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },
                    ],
                },
            ],
        });

        return res.json({ error: null, data: contratos });
    }

    async responsavel(req, res) {
        const { cpf } = req.body;
        const { limit = 20, page = 1, ...querya } = req.query;
        const offset = (page - 1) * limit;

        const criteria = queryStringConverter.convert({ query: querya });
        const cpfCriteria = queryStringConverter.convert({ query: {...((cpf && { cpf }) || {}) } });

        console.log(criteria);
        console.log(cpfCriteria);

        const contratos = await Contrato.findAll({
            ...criteria,
            limit,
            offset,
            attributes: { exclude: ['infoStatus'] },
            include: [
                { model: PessoaJuridica, as: 'operadora', attributes: ['id', 'nomefantasia', 'razaosocial', 'cnpj'] },
                { model: PessoaFisica, as: 'responsavel_pessoafisica', ...cpfCriteria },
                { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
                { model: Status, as: 'infoStatus', attributes: ['descricao'] },
                { model: TipoCarteira, as: 'infoCarteira', attributes: ['descricao'] },
                { model: TipoContrato, as: 'infoContrato', attributes: ['descricao'] },
                { model: TipoTabelaUso, as: 'infoTabelaUso', attributes: ['descricao'] },
                { model: TipoOcorrencia, as: 'infoAdesao', attributes: ['descricao'] },
                { model: TipoOcorrencia, as: 'infoCancelamento', attributes: ['descricao'] },
                {
                    model: GrupoFamiliar,
                    as: 'gruposfamiliar',
                    include: [{
                            model: PessoaFisica,
                            as: 'beneficiarios',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },

                        {
                            model: PessoaFisica,
                            as: 'responsaveis',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },
                    ],
                },
            ],
        });

        console.log(contratos);

        return res.json({ error: null, data: contratos });
    }

    async show(req, res) {
        const { id } = req.params;

        const contrato = await Contrato.findByPk(id, {
            include: [
                { model: PessoaFisica, as: 'responsavel_pessoafisica' },
                { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
            ],
        });

        return res.json({ error: null, data: contrato });
    }

    async store(req, res) {
        const {
            formValidation: { Beneficiarios, Pagamentos, ResponsavelFinanceiro, ...rest },
            sequelize,
            params: { operator: operadora },
        } = req;
        const transaction = await sequelize.transaction();

        try {
            const [infoVigencia] = await sequelize.query(
                'SELECT * FROM cn_regravigenciacontrato WHERE rvc_ds_vigencia_contrato ILIKE :vigencia LIMIT 1', { replacements: { vigencia: rest.PrazoVigencia }, type: QueryTypes.SELECT, transaction }
            );

            const fullValue =
                (Beneficiarios.reduce((previous, current) => previous + parseFloat(current.Valor), 0) *
                    parseInt(infoVigencia.mesesvigencia, 10)) /
                parseInt(rest.FormaPagamento.Parcelas, 10);

            const amountPaid = Pagamentos ?
                Pagamentos.reduce((previous, current) => previous + parseFloat(current.Valor), 0) :
                0;

            const diffPorcentage = Math.abs((amountPaid - fullValue) / fullValue);

            const isSurcharge = fullValue < amountPaid;

            const plans = Object.values(
                _(Beneficiarios)
                .groupBy((beneficiario) => beneficiario.Produto)
                .value()
            );

            console.log(plans.length);

            const contratos = [];

            for (const [index, beneficiarios] of plans.entries()) {
                const pagamentoContrato =
                    (parseFloat(beneficiarios.reduce((previous, current) => previous + parseFloat(current.Valor), 0)) *
                        parseInt(infoVigencia.mesesvigencia, 10)) /
                    parseInt(rest.FormaPagamento.Parcelas, 10);

                const contrato = await CriarContratoService({
                    operadora,
                    connection: sequelize,
                    transaction,
                    data: {
                        ...rest,
                        Produto: beneficiarios[0].Produto,
                        Beneficiarios: beneficiarios,
                        ResponsavelFinanceiro: {
                            ...ResponsavelFinanceiro,
                            ...(index === 0 ? { Enderecos: ResponsavelFinanceiro.Enderecos } : { Enderecos: [] }),
                            ...(index === 0 ? { Emails: ResponsavelFinanceiro.Emails } : { Emails: [] }),
                            ...(index === 0 ? { Telefones: ResponsavelFinanceiro.Telefones } : { Telefones: [] }),
                        },
                        ...(Pagamentos ?
                            {
                                Pagamentos: Pagamentos.map((pagamento) => ({
                                    ...pagamento,
                                    Valor: isSurcharge ?
                                        pagamentoContrato + pagamentoContrato * diffPorcentage :
                                        pagamentoContrato - pagamentoContrato * diffPorcentage,
                                })),
                            } :
                            {}),
                    },
                });
                contratos.push(contrato);
            }

            await transaction.commit();
            // await transaction.rollback();
            return res.json({ error: null, data: contratos });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async migrar(req, res) {
        const transaction = await req.sequelize.transaction();
        try {
            const migration = await MigrarContratoService({
                connection: req.sequelize,
                transaction,
                idcontrato: req.params.id,
                operadora: req.params.operator,
                data: req.body,
            });

            await transaction.commit();

            return res.json(migration);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(req, res) {
        const {
            body: {
                numerocontrato = null,
                numeroproposta = null,
                operadoraid = null,
                statusid = null,
                dataadesao = null,
                datacancelamento = null,
                dataregistrosistema = null,
                datalimitecancelamento = null,
                datainicialvigencia = null,
                datafinalvigencia = null,
                ciclovigenciacontrato = null,
                quantidademesesvigencia = null,
                temporeativacao = null,
                prazolimitebloqueio = null,
                obs = null,
                tipocontratoid = null,
                tipotabelausoid = null,
                descontotabelauso = null,
                chaveex = null,
                tipodecarteiraid = null,
                databloqueio = null,
                motivoadesaoid = null,
                motivocancelamentoid = null,
                datareativacao = null,
                bloqueadopesquisa = null,
                localid = null,
                con_in_renovacao_auto = null,
                con_dt_geracao_parcelas = null,
                con_in_situacao = null,
                con_id_regra_vigencia = null,
                importado = null,
                con_nu_prazo_cancela_inad = null,
                tipodecarteiracontratoid = null,
                id_gld = null,
                centrocustoid = null,
            },
            params: { id = null },
        } = req.body;

        const data = {
            ...(numerocontrato ? { numerocontrato } : {}),
            ...(numeroproposta ? { numeroproposta } : {}),
            ...(operadoraid ? { operadoraid } : {}),
            ...(statusid ? { statusid } : {}),
            ...(dataadesao ? { dataadesao } : {}),
            ...(datacancelamento ? { datacancelamento } : {}),
            ...(dataregistrosistema ? { dataregistrosistema } : {}),
            ...(datalimitecancelamento ? { datalimitecancelamento } : {}),
            ...(datainicialvigencia ? { datainicialvigencia } : {}),
            ...(datafinalvigencia ? { datafinalvigencia } : {}),
            ...(ciclovigenciacontrato ? { ciclovigenciacontrato } : {}),
            ...(quantidademesesvigencia ? { quantidademesesvigencia } : {}),
            ...(temporeativacao ? { temporeativacao } : {}),
            ...(prazolimitebloqueio ? { prazolimitebloqueio } : {}),
            ...(obs ? { obs } : {}),
            ...(tipocontratoid ? { tipocontratoid } : {}),
            ...(tipotabelausoid ? { tipotabelausoid } : {}),
            ...(descontotabelauso ? { descontotabelauso } : {}),
            ...(chaveex ? { chaveex } : {}),
            ...(tipodecarteiraid ? { tipodecarteiraid } : {}),
            ...(databloqueio ? { databloqueio } : {}),
            ...(motivoadesaoid ? { motivoadesaoid } : {}),
            ...(motivocancelamentoid ? { motivocancelamentoid } : {}),
            ...(datareativacao ? { datareativacao } : {}),
            ...(bloqueadopesquisa ? { bloqueadopesquisa } : {}),
            ...(localid ? { localid } : {}),
            ...(con_in_renovacao_auto ? { con_in_renovacao_auto } : {}),
            ...(con_dt_geracao_parcelas ? { con_dt_geracao_parcelas } : {}),
            ...(con_in_situacao ? { con_in_situacao } : {}),
            ...(con_id_regra_vigencia ? { con_id_regra_vigencia } : {}),
            ...(importado ? { importado } : {}),
            ...(con_nu_prazo_cancela_inad ? { con_nu_prazo_cancela_inad } : {}),
            ...(tipodecarteiracontratoid ? { tipodecarteiracontratoid } : {}),
            ...(id_gld ? { id_gld } : {}),
            ...(centrocustoid ? { centrocustoid } : {}),
        };

        const contrato = await Contrato.update(data, {
            where: { id },
            returning: true,
        });

        return res.json({ error: null, data: contrato });
    }

    async adicionarAssociado(req, res) {
        const {
            body: {
                GrupoFamiliar: id_grupofamiliar,
                Vinculo: vinculo,
                Vendedor: id_vendedor,
                Corretora: id_corretor,
                Pagamentos: pagamentos,
                ...beneficiario
            },
            params: { id: id_contrato },
            sequelize,
        } = req;

        await AdicionarMembroContratoService.execute({
            beneficiario,
            id_contrato,
            id_grupofamiliar,
            id_vendedor,
            id_corretor,
            sequelize,
            pagamentos,
            vinculo,
        });

        const contrato = await Contrato.findByPk(id_contrato, {
            include: [
                { model: PessoaFisica, as: 'responsavel_pessoafisica' },
                { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
                {
                    model: GrupoFamiliar,
                    as: 'gruposfamiliar',
                    include: [{
                            model: PessoaFisica,
                            as: 'beneficiarios',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },

                        {
                            model: PessoaFisica,
                            as: 'responsaveis',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },
                    ],
                },
            ],
        });

        return res.json({ error: null, data: contrato });
    }

    async removerAssociado(req, res) {
        const { id: id_contrato, beneficiarioid: id_beneficiario } = req.params;

        await RemoveMembroContratoService.execute({ sequelize: req.sequelize, id_beneficiario, id_contrato });

        const contrato = await Contrato.findByPk(id_contrato, {
            include: [
                { model: PessoaFisica, as: 'responsavel_pessoafisica' },
                { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
                {
                    model: GrupoFamiliar,
                    as: 'gruposfamiliar',
                    include: [{
                            model: PessoaFisica,
                            as: 'beneficiarios',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },

                        {
                            model: PessoaFisica,
                            as: 'responsaveis',
                            attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
                            through: {
                                as: 'dados',
                                attributes: [
                                    'dataadesao',
                                    'ativo',
                                    'datadesativacao',
                                    'tipobeneficiarioid',
                                    'versaoplanoid',
                                    'planoid',
                                    'tipobeneficiarioid',
                                    'tipocarteiraid',
                                    'valor',
                                    'descontovalor',
                                    'descontoporcent',
                                ],
                            },
                        },
                    ],
                },
            ],
        });

        return res.json({ error: null, data: contrato });
    }

    async cancel(req, res) {
        const { id } = req.params;

        const contrato = await Contrato.findByPk(id);

        if (!contrato) {
            return res.status(403).json({ error: 403, data: { message: 'Contrato cannot find ' } });
        }

        contrato.update({
            statusid: 7,
        });

        return res.status(201).json({
            error: null,
            data: { message: 'Contract canceled successfully' },
        });
    }

    async destroy(req, res) {
        const {
            sequelize,
            params: { id },
        } = req;

        const transaction = await sequelize.transaction();

        try {
            await DestroyContractService.execute({ id_contrato: id, connection: sequelize, transaction });

            await transaction.commit();

            return res.sendStatus(202);
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async block(req, res) {
        try {
            const schema = Yup.object().shape({
                id: Yup.number().integer().required(),
            });

            await schema.validate(req.params);

            const { id } = req.params;

            const contrato = await Contrato.findByPk(id);

            if (!contrato) {
                return res.status(401).json({ error: 401, data: { message: 'Contrato cannot find ' } });
            }

            await contrato.update({
                statusid: 3,
            });

            return res.status(201).json({
                error: null,
                data: { message: 'Contract successfully blocked' },
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                return res.status(401).json({
                    error: 401,
                    data: { message: 'Validation fails', errors: err.errors },
                });
            }
            return res.status(404).json({ error: 404, data: { message: 'Internal Server Error' } });
        }
    }

    async unlock(req, res) {
        try {
            const schema = Yup.object().shape({
                id: Yup.number().integer().required(),
            });

            await schema.validate(req.params);

            const { id } = req.params;

            const contrato = await Contrato.findByPk(id);

            if (!contrato) {
                return res.status(401).json({ error: 401, data: { message: 'Contrato cannot find ' } });
            }

            if (contrato.statusid === 7) {
                return res.status(401).json({
                    error: 401,
                    data: {
                        message: 'It is not possible to change a canceled contract ',
                    },
                });
            }

            const contratoUpdated = await contrato.update({
                statusid: 8,
            }, {
                returning: true,
            });

            return res.status(201).json({
                error: null,
                data: {
                    message: 'Contract successfully unlocked',
                    data: contratoUpdated,
                },
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                return res.status(401).json({
                    error: 401,
                    data: { message: 'Validation fails', errors: err.errors },
                });
            }
            return res.status(404).json({ error: 404, data: { message: 'Internal Server Error' } });
        }
    }

    async enable(req, res) {
        const {
            params: { id: id_contrato },
            body: { dataAdesao: data_adesao },
            sequelize,
        } = req;

        const transaction = await sequelize.transaction();

        try {
            await AtivarContratoService({ sequelize, transaction, id_contrato, data_adesao });

            await transaction.commit();
            return res.sendStatus(201);
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            throw error;
        }
    }

    async findContratoWithProduto(req, res) {
        const {
            params: { id },
            sequelize,
        } = req;

        let querySql = `select b.contratoid, cp.id as produtoid, cp.descricao as produto,
                            b.planoid,  c.descricao as plano,
                            b.versaoplanoid, cv.descricao as versao, b.valor from cn_beneficiario b
                        inner join cn_produto cp on b.planoid = cp.planoid and b.versaoplanoid = cp.versaoid
                        inner join cn_plano c on cp.planoid = c.id
                        inner join cn_versaoplano cv on cp.versaoid = cv.id
                        where b.ativo = '1' and contratoid = ${id};`;

        console.log(querySql);

        const [contrato] = await sequelize.query(querySql);

        return res.json({ error: null, data: contrato });
    }
}

export default new ContratoController();
