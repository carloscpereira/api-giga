/* eslint-disable no-restricted-syntax */
import { Op, Sequelize, Transaction, QueryTypes } from 'sequelize';

// import { isAfter, isBefore, isEqual, parseISO, setDate, startOfDay, subDays, subMonths } from 'date-fns';

import Contrato from '../models/Sequelize/Contrato';
// import Parcela from '../models/Sequelize/Parcela';
import Produto from '../models/Sequelize/Produto';
import Titulo from '../models/Sequelize/Titulo';
import Beneficiario from '../models/Sequelize/Beneficiario';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import AssociadoPJ from '../models/Sequelize/AssociadoPJ';
import AssociadoPF from '../models/Sequelize/AssociadoPF';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

import CriarContratoService from './CriarContratoService';

import AppError from '../errors/AppError';

export default async ({
  connection,
  transaction,
  idcontrato,
  operadora,
  data: {
    Beneficiarios,
    Produto: idproduto,
    Corretora,
    Vendedor,
    Convenio,
    Pagamentos,
    DataPagamento,
    DataVencimento,
    Responsavel,
  },
}) => {
  let t = transaction;

  if (!connection || !(connection instanceof Sequelize)) {
    throw new AppError(500, 'Não foi possível estabalecer conexão com o banco de dados');
  }

  if (!transaction || !(transaction instanceof Transaction)) {
    t = await connection.transaction();
  }

  try {
    const contrato = await Contrato.findOne({
      where: {
        id: idcontrato,
        statusid: 8,
        tipocontratoid: { [Op.in]: [5, 9] },
        datacancelamento: { [Op.is]: null },
      },
      transaction: t,
    });

    if (!contrato) {
      throw new AppError(404, 'Contrato inexistente, cancelado ou impossibilitado de realizar operação');
    }

    let dadosContrato = null;

    if (contrato.tipocontratoid === 9) {
      dadosContrato = await AssociadoPJ.findByPk(contrato.id, { transaction: t });
    } else {
      dadosContrato = await AssociadoPF.findByPk(contrato.id, { transaction: t });
    }

    if (!dadosContrato) {
      throw new AppError(404, 'Não foi possível estabelecer os dados do contrato');
    }

    const titulo = await Titulo.findOne({
      where: {
        numerocontratoid: contrato.id,
        dataperiodoinicial: { [Op.lte]: new Date() },
        dataperiodofinal: { [Op.gte]: new Date() },
        statusid: 1,
      },
      transaction: t,
    });

    if (!titulo) {
      throw new AppError(
        406,
        'Não é possível completar a operação, pois, o contrato escolhido não possui titulos em vigencia'
      );
    }

    // const parcelas = await Parcela.findAll({
    //   include: [{ model: Titulo, as: 'titulo', where: { numerocontratoid: contrato.id }, required: true }],
    // });

    // const contratoInadimplente = parcelas.some(
    //   (parcela) =>
    //     Number.parseInt(parcela.statusgrupoid, 10) === 1 && isBefore(parseISO(parcela.datavencimento), new Date())
    // );

    // if (contratoInadimplente) {
    //   throw new Error('Contrato possui parcelas que ainda não foram quitadas.');
    // }

    // deixar comentado
    // let vencimentoAtual = setDate(new Date(), dadosContrato.diavencimento);

    // if (isAfter(vencimentoAtual, new Date())) {
    //   vencimentoAtual = subMonths(vencimentoAtual, 1);
    // }

    // const parcelaVigente = parcelas.find((parcela) =>
    //   isEqual(parseISO(parcela.datavencimento), startOfDay(vencimentoAtual))
    // );
    let responsavel = null;

    if (Responsavel) {
      responsavel = await PessoaFisica.findOne({ where: { cpf: Responsavel.CPF }, transaction: t });
    } else if (contrato.tipocontratoid === 5) {
      responsavel = await PessoaFisica.findByPk(dadosContrato.responsavelfinanceiroid, { transaction: t });
    }

    if (!responsavel) {
      throw new AppError(406, 'Não foi possível encontrar o responsável');
    }

    const [{ cns: cnsResponsavel }] = await connection.query(
      `
      SELECT sp.dadocampo as "cns"
      FROM sp_camposdinamicos cd
        INNER JOIN sp_vinculo sv on sv.id = cd.sp_vinculoid
        INNER JOIN sp_pessoaatributovinculo sp on sv.id = sp.vinculoid and sp.campo = cd.campo
      WHERE descricaocampo ILIKE '%CNS%' AND pessoaid = :ID_RESPONSAVEL_FINANCEIRO LIMIT 1;
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { ID_RESPONSAVEL_FINANCEIRO: responsavel.id },
        transaction: t,
      }
    );

    let beneficiarios = null;

    if (contrato.tipocontratoid === 5) {
      beneficiarios = await Beneficiario.findAll({
        where: { contratoid: contrato.id, ativo: '1' },
        include: [{ model: PessoaFisica, as: 'dados' }],
        transaction: t,
      });
    } else {
      beneficiarios = await Beneficiario.findAll({
        where: { contratoid: contrato.id, responsavelgrupo: responsavel.id, ativo: '1' },
        include: [{ model: PessoaFisica, as: 'dados' }],
        transaction: t,
      });
    }

    const produto = await Produto.findOne({
      where: {
        id: idproduto,
        pro_id_tipo_contrato: contrato.tipocontratoid,
      },
      transaction: t,
    });

    if (!produto) {
      throw new AppError(
        406,
        'Produto selecionado não encontrado ou está indisponível para o tipo contrato selecionado'
      );
    }

    const beneficiariosProposta = [];
    // let valorProposta = 0;

    if (!Beneficiarios || !Array.isArray(Beneficiarios) || !Beneficiarios.length) {
      for (const beneficiario of beneficiarios) {
        const [{ valor: valorProduto }] = await connection.query(
          `
                SELECT cn_planotipobeneficiario.valor
                FROM cn_planotipobeneficiario
                INNER JOIN cn_tabelaprecoplano
                  ON cn_planotipobeneficiario.tabelaprecoplanoid = cn_tabelaprecoplano.id
                WHERE (cn_planotipobeneficiario.tipobeneficiarioid = :P_ID_TIPOBENEFICIARIO OR cn_planotipobeneficiario.tipobeneficiarioid = 1)
                  AND (cn_tabelaprecoplano.planoid = :P_ID_PLANO)
                  AND (cn_tabelaprecoplano.versaoid = :P_ID_VERSAO)
                  AND (
                        (
                          (cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF) AND (cn_tabelaprecoplano.dtvalidadefinal >= :P_DT_ADESAO_BENEF)
                        ) OR (
                          (cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF) AND (cn_tabelaprecoplano.dtvalidadefinal IS NULL)
                        )
                      )
                ORDER BY cn_planotipobeneficiario.tipobeneficiarioid DESC LIMIT 1;
              `,
          {
            type: QueryTypes.SELECT,
            replacements: {
              P_ID_TIPOBENEFICIARIO: beneficiario.tipobeneficiarioid,
              P_ID_PLANO: produto.planoid,
              P_ID_VERSAO: produto.versaoid,
              P_DT_ADESAO_BENEF: new Date(),
            },
          }
        );

        // valorProposta += Number.parseFloat(valorProduto);

        beneficiariosProposta.push({
          beneficiario,
          cpf: beneficiarios.dados.cpf,
          valor: Number.parseFloat(valorProduto),
        });
      }
    } else if (Beneficiarios && Array.isArray(Beneficiarios) && Beneficiarios.length) {
      for (const beneficiario of Beneficiarios) {
        const tipoBeneficiario = await TipoBeneficiario.findOne({
          where: { codigo: Number.parseInt(beneficiario.Vinculo, 10) },
          transaction: t,
        });

        if (!tipoBeneficiario) {
          throw new AppError(404, 'Tipo de beneficiário informado não existe');
        }

        const [{ valor: valorProduto }] = await connection.query(
          `
                SELECT cn_planotipobeneficiario.valor
                FROM cn_planotipobeneficiario
                INNER JOIN cn_tabelaprecoplano
                  ON cn_planotipobeneficiario.tabelaprecoplanoid = cn_tabelaprecoplano.id
                WHERE (cn_planotipobeneficiario.tipobeneficiarioid = :P_ID_TIPOBENEFICIARIO OR cn_planotipobeneficiario.tipobeneficiarioid = 1)
                  AND (cn_tabelaprecoplano.planoid = :P_ID_PLANO)
                  AND (cn_tabelaprecoplano.versaoid = :P_ID_VERSAO)
                  AND (
                        (
                          (cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF) AND (cn_tabelaprecoplano.dtvalidadefinal >= :P_DT_ADESAO_BENEF)
                        ) OR (
                          (cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF) AND (cn_tabelaprecoplano.dtvalidadefinal IS NULL)
                        )
                      )
                ORDER BY cn_planotipobeneficiario.tipobeneficiarioid DESC LIMIT 1;
              `,
          {
            type: QueryTypes.SELECT,
            transaction: t,
            replacements: {
              P_ID_TIPOBENEFICIARIO: tipoBeneficiario.id,
              P_ID_PLANO: produto.planoid,
              P_ID_VERSAO: produto.versaoid,
              P_DT_ADESAO_BENEF: beneficiario.DataAdesao || new Date(), // Se a data de adesão não for informada, considerará a data atual
            },
          }
        );

        // valorProposta += Number.parseFloat(beneficiario.Valor) || Number.parseFloat(valorProduto);

        const checarBeneficiario = beneficiarios.find(({ dados: { cpf } }) => cpf === beneficiario.CPF);

        if (checarBeneficiario) {
          beneficiariosProposta.push({
            beneficiario: checarBeneficiario,
            cpf: checarBeneficiario.dados.cpf,
            beneficiarioEnviado: beneficiario,
            valor: Number.parseFloat(beneficiario.Valor) || Number.parseFloat(valorProduto),
            vinculo: tipoBeneficiario.codigo,
          });
        }
      }
    }

    if (!beneficiariosProposta.length) {
      throw new AppError(400, 'É necessário informar beneficiários do contrato para realizar a migração');
    }

    const [{ id: motivoAdesaoID }, tipoCarteira] = await Promise.all([
      connection.query(`SELECT * FROM cn_tipocorrencia WHERE codigo_plano = '1' LIMIT 1`, {
        type: QueryTypes.SELECT,
        transaction: t,
      }),
      TipoCarteira.findByPk(contrato.tipodecarteiracontratoid),
    ]);

    const beneficiariosFormatados = beneficiariosProposta.map((beneficiario) => ({
      Produto: produto.id,
      Valor: beneficiario.valor,
      MotivoAdesao: motivoAdesaoID,
      Vinculo: beneficiario.vinculo,
      DataAdesao: beneficiario.beneficiario.dataadesao,
      RG: beneficiario.beneficiario.dados.rg,
      CPF: beneficiario.beneficiario.dados.cpf,
      DataNascimento: beneficiario.beneficiario.dados.datanascimento,
      sexo: beneficiario.beneficiario.dados.sexo,
      OrgaoEmissor: beneficiario.beneficiario.dados.orgaoEmissor,
      Nacionalidade: beneficiario.beneficiario.dados.nacionalidade,
      TipoVinculoID: beneficiario.beneficiario.tipobeneficiarioid,
      ...(beneficiario.beneficiarioEnviado ? { ...beneficiario.beneficiarioEnviado } : {}),
    }));

    //* * Criar contrato */
    const novoContrato = await CriarContratoService({
      connection,
      operadora,
      transaction: t,
      data: {
        Parent: contrato.id,
        CentroCusto: contrato.centrocustoid,
        TipoContrato: contrato.tipocontratoid,
        MotivoAdesao: motivoAdesaoID,
        Convenio,
        Vendedor,
        Corretora,
        DataAdesao: new Date(),
        Produto: produto.id,
        DataPagamento,
        DataVencimento,
        Pagamentos,
        FormaPagamento: {
          TipoCarteira: contrato.tipodecarteiracontratoid,
          DiaVencimentoMes: dadosContrato.diavencimento,
          Modalidade: tipoCarteira.modalidadepagamentoid,
        },
        ResponsavelFinanceiro: {
          TipoPessoa: 'F',
          Nome: responsavel.nome,
          RG: responsavel.rg,
          CPF: responsavel.cpf,
          DataNascimento: responsavel.datanascimento,
          Sexo: responsavel.sexo,
          EstadoCivil: responsavel.estadocivilid,
          OrgaoEmissor: responsavel.orgaoemissor,
          Nacionalidade: responsavel.nacionalidade,
          NomeDaMae: responsavel.nomedamae,
          Cns: cnsResponsavel,
        },
        Beneficiarios: beneficiariosFormatados,
      },
    });
    // Processo de migração
    // if (contrato.tipocontratoid === 9) {

    // } else {
    // }

    // const beneficiariosNaoInclusos = beneficiarios.;
    if (!transaction) await t.commit();

    return { old: contrato, new: novoContrato };
    // await t.rollback();
  } catch (error) {
    if (!transaction) await t.rollback();

    throw error;
  }
};
