/* eslint-disable no-restricted-syntax */
import {
  addMonths,
  format,
  isAfter,
  isBefore,
  isEqual,
  parse,
  setDate,
  startOfDay,
  subDays,
  getDay,
  subBusinessDays,
  parseISO,
} from 'date-fns';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import axios from 'axios';
import CriaPessoaFisicaService from './CriaPessoaFisicaService';
import AdicionarVinculoService from './AdicionarVinculoService';
import AdicionarEnderecoService from './AdicionarEnderecoService';
import AdicionarTelefoneService from './AdicionarTelefoneService';
import AdicionarEmailService from './AdicionarEmailService';
import AdicionarCartaoCreditoService from './AdicionarCartaoCreditoService';
import AdicionarContaService from './AdicionarContaService';
import BaixarParcelaService from './BaixarParcelaService';

import Produto from '../models/Sequelize/Produto';
import CentroCusto from '../models/Sequelize/CentroCusto';
import Contrato from '../models/Sequelize/Contrato';
import Beneficiario from '../models/Sequelize/Beneficiario';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';
import ModalidadePagamento from '../models/Sequelize/ModalidadePagamento';

import GerarCarteira from '../helpers/GerarCarteira';
import TipoCarteira from '../models/Sequelize/TipoCarteira';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import RegraFechamento from '../models/Sequelize/RegraFechamento';
import AssociadoPJ from '../models/Sequelize/AssociadoPJ';
import AppError from '../errors/AppError';

const bv = {
  PESSOA_FISICA: 4,
  REPONSAVEL_FINANCEIRO: 12,
  TITULAR: 14,
  CONJUGE: 15,
  COMPANHEIRO: 15,
  FILHO: 16,
  FILHA: 16,
  ENTEADO: 19,
  ENTEADA: 19,
  PAI: 21,
  MAE: 21,
  AGREGADO: 22,
  OUTROS: 22,
  SERVIDOR_PUBLICO_ESTADUAL: 26,
  SERVIDOR_PUBLICO_MUNICIPAL: 27,
  SERVIDOR_PUBLICO_FEDERAL: 28,
};

export default async ({
  operadora,
  alterarVinculo = true,
  connection,
  transaction,
  data: {
    Averbacao,
    Beneficiarios,
    Observacao,
    CentroCusto: centroCustoId,
    Corretora,
    Convenio,
    DataAdesao,
    DataFechamento,
    DataPagamento,
    DataVencimento,
    Descontos,
    Acrescimos,
    FormaPagamento: { Parcelas, DiaVencimentoMes, Modalidade, TipoCarteira: tipoCarteiraId, CartaoCredito, Conta },
    MotivoAdesao,
    Pagamentos,
    Parent,
    PrazoVigencia,
    Produto: produtoId,
    ResponsavelFinanceiro: { Enderecos, Telefones, Emails, ...ResponsavelFinanceiro },
    TipoContrato,
    Vendedor,
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
    const dataVencimentoMes = parse(DiaVencimentoMes, 'dd', new Date());
    const formatoData = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
    const dataAtual = startOfDay(new Date());
    const margemAntecipacao = 5;

    let dataAdesao;

    console.log(isEqual(dataVencimentoMes, dataAtual));
    console.log(isAfter(dataAtual, dataVencimentoMes));
    console.log(!DataPagamento);
    console.log(!DataVencimento);
    console.log(
      isEqual(dataVencimentoMes, dataAtual) ||
        (isAfter(dataAtual, dataVencimentoMes) && !DataPagamento && !DataVencimento)
    );

    if (
      isEqual(dataVencimentoMes, dataAtual) ||
      (isAfter(dataAtual, dataVencimentoMes) && !DataPagamento && !DataVencimento)
    ) {
      dataAdesao = addMonths(dataVencimentoMes, 1);
    } else if (DataPagamento || DataVencimento) {
      dataAdesao = DataVencimento || setDate(DataPagamento, DiaVencimentoMes);
    } else {
      dataAdesao = dataVencimentoMes;
    }

    dataAdesao = DataAdesao || dataAdesao;

    const produto = await Produto.findOne({
      where: {
        id: produtoId,
        pro_id_tipo_contrato: TipoContrato,
        prd_in_bloqueado: false,
      },
      transaction: t,
    });

    if (!produto) {
      throw new AppError(
        404,
        'Produto selecionado não encontrado ou não está disponível para o tipo de contrato selecionado'
      );
    }

    let centroCusto = centroCustoId ? await CentroCusto.findByPk(centroCustoId, { transaction: t }) : null;

    if (Number.parseInt(TipoContrato, 10) === 5 && !centroCusto) {
      centroCusto = await CentroCusto.findByPk(194, { transaction: t });
    }

    if (!centroCusto) {
      throw new AppError(400, 'Centro de Resultados não informado ou inválido');
    }

    let vendedor = null;

    if (Vendedor) {
      const [row] = await connection.query(
        `
      SELECT sp_dadospessoafisica.id    AS vendedorid,
              sp_dadospessoafisica.nome AS nome,
              cn_corretorpf.id          AS corretoraid
      FROM   sp_dadospessoafisica
              INNER JOIN cn_grupocorretores
                      ON cn_grupocorretores.corretorvendedor = sp_dadospessoafisica.id
              INNER JOIN cn_corretorpf
                      ON cn_corretorpf.corretorapjid =
                        cn_grupocorretores.corretorpessoaj
      WHERE  (cn_grupocorretores.corretorvendedor IS NOT NULL)
              AND (sp_dadospessoafisica.id = :vendedorid AND cn_corretorpf.id = :corretoraid)
      ORDER  BY sp_dadospessoafisica.nome;
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { vendedorid: Vendedor, corretoraid: Corretora },
          transaction: t,
        }
      );

      if (!row) {
        throw new AppError(404, 'Vendedor não encontrado em nosso banco de dados');
      }

      vendedor = row;
    }

    if (!Beneficiarios) {
      throw new AppError(400, 'Você deve informar os Beneficiarios a serem inseridos no contrato');
    }

    const responsavel = await CriaPessoaFisicaService.execute({
      usuario: 'N',
      nome: ResponsavelFinanceiro.Nome,
      rg: ResponsavelFinanceiro.RG,
      cpf: ResponsavelFinanceiro.CPF,
      datanascimento: ResponsavelFinanceiro.DataNascimento,
      sexo: ResponsavelFinanceiro.Sexo,
      orgaoemissor: ResponsavelFinanceiro.OrgaoEmissor,
      nomedamae: ResponsavelFinanceiro.NomeDaMae,
      nacionalidade: ResponsavelFinanceiro.Nacionalidade,
      estadocivil: ResponsavelFinanceiro.EstadoCivil,
      sequelize: connection,
      transaction: t,
    });

    const responsavelIsTitular = !!Beneficiarios.find(({ CPF, Titular }) => CPF === responsavel.cpf && Titular);

    await responsavel.addOrganogramas(centroCusto, { transaction: t });
    await responsavel.setTiposcontrato([TipoContrato], { transaction: t });

    await AdicionarVinculoService.execute({
      pessoa: responsavel,
      vinculo: bv.PESSOA_FISICA,
      atributos: {
        ...ResponsavelFinanceiro,
        DataDeNascimento: ResponsavelFinanceiro.DataNascimento,
        ...(ResponsavelFinanceiro.Matricula ? { NºDaMatricula: ResponsavelFinanceiro.Matricula } : {}),
      },
      alteravel: alterarVinculo,
      sequelize: connection,
      transaction: t,
    });

    await AdicionarVinculoService.execute({
      pessoa: responsavel,
      vinculo: bv.REPONSAVEL_FINANCEIRO,
      atributos: {
        ...ResponsavelFinanceiro,
        DataDeNascimento: ResponsavelFinanceiro.DataNascimento,
        ...(ResponsavelFinanceiro.Matricula ? { NºDaMatricula: ResponsavelFinanceiro.Matricula } : {}),
      },
      alteravel: alterarVinculo,
      sequelize: connection,
      transaction: t,
    });

    if (Convenio === 'Municipio') {
      await AdicionarVinculoService.execute({
        pessoa: responsavel,
        vinculo: bv.SERVIDOR_PUBLICO_MUNICIPAL,
        alteravel: alterarVinculo,
        atributos: {
          ...ResponsavelFinanceiro,
          DataDeNascimento: ResponsavelFinanceiro.DataNascimento,
          ...(ResponsavelFinanceiro.Matricula ? { NºDaMatricula: ResponsavelFinanceiro.Matricula } : {}),
        },
        sequelize: connection,
        transaction: t,
      });
    }

    if (Convenio === 'Estado') {
      await AdicionarVinculoService.execute({
        pessoa: responsavel,
        vinculo: bv.SERVIDOR_PUBLICO_ESTADUAL,
        alteravel: alterarVinculo,
        atributos: {
          ...ResponsavelFinanceiro,
          DataDeNascimento: ResponsavelFinanceiro.DataNascimento,
          ...(ResponsavelFinanceiro.Matricula ? { NºDaMatricula: ResponsavelFinanceiro.Matricula } : {}),
        },
        sequelize: connection,
        transaction: t,
      });
    }

    if (Convenio === 'Federal') {
      await AdicionarVinculoService.execute({
        pessoa: responsavel,
        vinculo: bv.SERVIDOR_PUBLICO_FEDERAL,
        alteravel: alterarVinculo,
        atributos: {
          ...ResponsavelFinanceiro,
          DataDeNascimento: ResponsavelFinanceiro.DataNascimento,
          ...(ResponsavelFinanceiro.Matricula ? { NºDaMatricula: ResponsavelFinanceiro.Matricula } : {}),
        },
        sequelize: connection,
        transaction: t,
      });
    }

    if (Enderecos && Array.isArray(Enderecos) && Enderecos.length && !responsavelIsTitular) {
      await Promise.all(
        Enderecos.map((endereco) =>
          AdicionarEnderecoService.execute({
            bairro: endereco.Bairro,
            cidade: endereco.Cidade,
            estado: endereco.Estado,
            logradouro: endereco.Logradouro,
            complemento: endereco.Complemento,
            numero: endereco.Numero,
            cep: endereco.Cep,
            end_in_principal: endereco.Principal,
            pessoa: responsavel,
            sequelize: connection,
            tipoenderecoid: endereco.TipoEndereco || 1,
            vinculoid: bv.REPONSAVEL_FINANCEIRO,
            transaction: t,
          })
        )
      );
    }

    if (Telefones && Array.isArray(Telefones) && Telefones.length && !responsavelIsTitular) {
      await Promise.all(
        Telefones.map((telefone) =>
          AdicionarTelefoneService.execute({
            numero: telefone.Numero,
            ramal: telefone.Ramal,
            tel_in_principal: telefone.Principal,
            tipotelefoneid: telefone.TipoTelefone || 3,
            vinculoid: bv.REPONSAVEL_FINANCEIRO,
            pessoa: responsavel,
            sequelize: connection,
            transaction: t,
          })
        )
      );
    }

    if (Emails && Array.isArray(Emails) && Emails.length && !responsavelIsTitular) {
      await Promise.all(
        Emails.map((email) =>
          AdicionarEmailService.execute({
            email: email.Email,
            tipoemail: email.TipoEmail || 3,
            ema_in_principal: email.Principal,
            dadosid: responsavel.id,
            vinculoid: bv.REPONSAVEL_FINANCEIRO,
            pessoa: responsavel,
            sequelize: connection,
            transaction: t,
          })
        )
      );
    }

    let cartaoCredito = null;
    const conta = null;
    console.log(conta);

    if (Number.parseInt(TipoContrato, 10) === 5) {
      if (CartaoCredito) {
        cartaoCredito = await AdicionarCartaoCreditoService.execute({
          pessoa: responsavel,
          transaction: t,
          sequelize: connection,
          car_in_principal: CartaoCredito.Principal,
          codigosegurancacartao: CartaoCredito.CodigoSeguranca,
          diadevencimento: CartaoCredito.DiaVencimento,
          nome_titular: CartaoCredito.Titular,
          numerocartao: CartaoCredito.Numero,
          tipocartaoid: CartaoCredito.TipoCartao,
          validadecartao: CartaoCredito.Validade,
        });
      }

      if (Conta) {
        await AdicionarContaService.execute({
          pessoa: responsavel,
          transaction: t,
          sequelize: connection,
          con_in_principal: Conta.Principal,
          agenciaid: Conta.Agencia,
          digito: Conta.Digito,
          numero: Conta.Numero,
          operacao: Conta.Operacao,
          tipocontaid: Conta.TipoConta,
          identificacao: Conta.Identificacao,
        });
      }
    }

    const beneficiarios = [];

    const beneficiarioTitular =
      Beneficiarios.find((beneficiario) => beneficiario.Titular) ||
      Beneficiarios.find((beneficiario) => beneficiario.CPF === responsavel.cpf) ||
      Beneficiarios[0];

    if (!beneficiarioTitular) {
      throw new AppError(400, 'É necessário informar um beneficiário titular para criação de um novo contrato');
    }

    for (const beneficiario of Beneficiarios) {
      const [valor] = await connection.query(
        `
        SELECT cn_planotipobeneficiario.valor
        FROM   cn_planotipobeneficiario
              INNER JOIN cn_tabelaprecoplano
                      ON cn_planotipobeneficiario.tabelaprecoplanoid =
                          cn_tabelaprecoplano.id
        WHERE  ( cn_planotipobeneficiario.tipobeneficiarioid = :P_ID_TIPOBENEFICIARIO )
              AND ( cn_tabelaprecoplano.planoid = :P_ID_PLANO )
              AND ( cn_tabelaprecoplano.versaoid = :P_ID_VERSAO )
              AND ( ( ( cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF )
                      AND ( cn_tabelaprecoplano.dtvalidadefinal >= :P_DT_ADESAO_BENEF )
                    )
                      OR ( ( cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF
                          )
                          AND ( cn_tabelaprecoplano.dtvalidadefinal IS NULL ) ) )
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            P_ID_TIPOBENEFICIARIO: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
            P_ID_PLANO: produto.planoid,
            P_ID_VERSAO: produto.versaoid,
            P_DT_ADESAO_BENEF: dataAdesao,
          },
          transaction: t,
        }
      );

      const pessoa = await CriaPessoaFisicaService.execute({
        usuario: 'N',
        nome: beneficiario.Nome,
        rg: beneficiario.RG,
        cpf: beneficiario.CPF,
        datanascimento: beneficiario.DataNascimento,
        sexo: beneficiario.Sexo,
        orgaoemissor: beneficiario.OrgaoEmissor,
        nomedamae: beneficiario.NomeDaMae,
        nacionalidade: beneficiario.Nacionalidade,
        estadocivil: beneficiario.EstadoCivil,
        sequelize: connection,
        transaction: t,
      });

      await pessoa.setTiposcontrato([TipoContrato], { transaction: t });
      await pessoa.addOrganogramas([centroCusto], { transaction: t });

      await AdicionarVinculoService.execute({
        atributos: {
          ...beneficiario,
          ...(!beneficiarioTitular.RG ? {} : { RgDoBeneficiarioTitular: beneficiarioTitular.RG }),
          ...(!beneficiarioTitular.DataNascimento ? {} : { DataDeNascimento: beneficiarioTitular.DataNascimento }),
          ...(!beneficiarioTitular.Matricula ? {} : { NºDaMatricula: beneficiarioTitular.Matricula }),
        },
        pessoa,
        sequelize: connection,
        alteravel: alterarVinculo,
        transaction: t,
        vinculo: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
      });

      const beneficiarioEnderecos =
        beneficiario.Enderecos && Array.isArray(beneficiario.Enderecos) && beneficiario.Enderecos.length
          ? beneficiario.Enderecos
          : Enderecos;
      const beneficiarioEmails =
        beneficiario.Emails && Array.isArray(beneficiario.Emails) && beneficiario.Emails.length
          ? beneficiario.Emails
          : Emails;
      const beneficiarioTelefones =
        beneficiario.Telefones && Array.isArray(beneficiario.Telefones) && beneficiario.Telefones.length
          ? beneficiario.Telefones
          : Telefones;

      if (beneficiarioEnderecos && Array.isArray(beneficiarioEnderecos) && beneficiarioEnderecos.length) {
        await Promise.all(
          beneficiarioEnderecos.map(async (endereco) =>
            AdicionarEnderecoService.execute({
              logradouro: endereco.Logradouro,
              bairro: endereco.Bairro,
              cidade: endereco.Cidade,
              estado: endereco.Estado,
              complemento: endereco.Complemento,
              numero: endereco.Numero,
              cep: endereco.Cep,
              tipoenderecoid: endereco.TipoEndereco || 1,
              end_in_principal: endereco.Principal,
              vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
              pessoa,
              sequelize: connection,
              transaction: t,
            })
          )
        );
      }

      if (beneficiarioEmails && Array.isArray(beneficiarioEmails) && beneficiarioEmails.length) {
        await Promise.all(
          beneficiarioEmails.map(async (email) =>
            AdicionarEmailService.execute({
              ema_in_principal: email.Principal,
              vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
              email: email.Email,
              pessoa,
              sequelize: connection,
              tipoemail: email.TipoEmail || 3,
              transaction: t,
            })
          )
        );
      }

      if (beneficiarioTelefones && Array.isArray(beneficiarioTelefones) && beneficiarioTelefones.length) {
        await Promise.all(
          beneficiarioTelefones.map(async (telefone) =>
            AdicionarTelefoneService.execute({
              numero: telefone.Numero,
              ramal: telefone.Ramal,
              tel_in_principal: telefone.Principal,
              vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
              tipotelefoneid: telefone.TipoTelefone || 3,
              pessoa,
              sequelize: connection,
              transaction: t,
            })
          )
        );
      }

      beneficiarios.push({
        pessoa,
        vinculo: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
        valorProduto: valor ? valor.valor : null,
        valor: beneficiario.Valor,
        motivoAdesao: beneficiario.MotivoAdesao || MotivoAdesao,
        dataAdesao: beneficiario.DataAdesao || dataAdesao,
      });
    }

    if (!beneficiarios.length) {
      throw new AppError(412, 'Erro ao tentar cadastrar o usuário');
    }

    const [{ valor: valorPadrao }] = await connection.query(
      `
      SELECT cn_planotipobeneficiario.valor
      FROM cn_planotipobeneficiario
              INNER JOIN cn_tabelaprecoplano
                          ON cn_planotipobeneficiario.tabelaprecoplanoid =
                            cn_tabelaprecoplano.id
      WHERE (cn_planotipobeneficiario.tipobeneficiarioid = :P_ID_TIPOBENEFICIARIO)
        AND (cn_tabelaprecoplano.planoid = :P_ID_PLANO)
        AND (cn_tabelaprecoplano.versaoid = :P_ID_VERSAO)
        AND (((cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF)
          AND (cn_tabelaprecoplano.dtvalidadefinal >= :P_DT_ADESAO_BENEF)
                )
          OR ((cn_tabelaprecoplano.dtvalidadeinicial <= :P_DT_ADESAO_BENEF
                  )
              AND (cn_tabelaprecoplano.dtvalidadefinal IS NULL)));
    `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          P_ID_TIPOBENEFICIARIO: 4,
          P_ID_PLANO: produto.planoid,
          P_ID_VERSAO: produto.versaoid,
          P_DT_ADESAO_BENEF: dataAdesao,
        },
        transaction: t,
      }
    );

    const valorBeneficiarios = beneficiarios.reduce(
      (anterior, atual) => anterior + Number.parseFloat(atual.valor || atual.valorProduto || valorPadrao),
      0
    );

    const valorProdutoSemDesconto = beneficiarios.reduce(
      (anterior, atual) => anterior + Number.parseFloat(atual.valorProduto || atual.valor || valorPadrao),
      0
    );

    let contrato;

    const [{ operadoraid }] = await connection.query(
      'SELECT pessoaoperadoraid as operadoraid FROM configuracao_sistema',
      {
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const carteirinha = await connection.query('SELECT * FROM cn_tipocarteira LIMIT 1', {
      type: QueryTypes.SELECT,
      plain: true,
      transaction: t,
    });

    const [infoVigencia] = await connection.query(
      'SELECT * FROM cn_regravigenciacontrato WHERE rvc_ds_vigencia_contrato ILIKE :vigencia LIMIT 1',
      {
        replacements: { vigencia: PrazoVigencia || 'BIENAL' },
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (Number.parseInt(TipoContrato, 10) === 5) {
      const [{ id: contratoId }] = await connection.query("SELECT NEXTVAL('cn_contrato_id_seq') as id", {
        type: QueryTypes.SELECT,
        transaction: t,
      });

      const qtdParcelas = Parcelas || infoVigencia.mesesvigencia;

      // const novaData = new Date(dataAdesao);
      // const dateTest = format(new Date(dataAdesao), formatoData);

      const dataTeste = {
        id: contratoId,
        numerocontrato: contratoId.toString().padStart(10, '0'),
        operadoraid,
        statusid: 8,
        dataadesao: format(new Date(dataAdesao), formatoData),
        datainicialvigencia: format(new Date(dataAdesao), formatoData),
        datafinalvigencia: format(addMonths(dataVencimentoMes, infoVigencia.mesesvigencia - 1), formatoData),
        dataregistrosistema: format(new Date(), formatoData),
        ciclovigenciacontrato: 1,
        quantidadedemesesvigencia: infoVigencia.mesesvigencia,
        con_id_regra_vigencia: infoVigencia.id,
        con_nu_prazo_cancela_inad: infoVigencia.rvc_nu_prazo_cancela_inad,
        prazolimitebloqueio: infoVigencia.prazobloqueio,
        tipocontratoid: 5,
        tipodecarteiraid: tipoCarteiraId,
        motivoadesaoid: MotivoAdesao,
        con_in_renovacao_auto: produto.prd_in_renovaauto,
        importado: 'N',
        localid: 1,
        bloqueadopesquisa: false,
        ...(Parent ? { contrato_parent: Number.parseInt(Parent, 10) } : {}),
        ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
        ...(cartaoCredito ? { cartaoid: cartaoCredito.id } : {}),
        ...(Observacao ? { obs: Observacao } : {}),
      };

      console.log(dataTeste);

      try {
        contrato = await Contrato.create(
          {
            id: contratoId,
            numerocontrato: contratoId.toString().padStart(10, '0'),
            operadoraid,
            statusid: 8,
            dataadesao: format(new Date(dataAdesao), formatoData),
            datainicialvigencia: format(new Date(dataAdesao), formatoData),
            datafinalvigencia: format(addMonths(dataVencimentoMes, infoVigencia.mesesvigencia - 1), formatoData),
            dataregistrosistema: format(new Date(), formatoData),
            ciclovigenciacontrato: 1,
            quantidadedemesesvigencia: infoVigencia.mesesvigencia,
            con_id_regra_vigencia: infoVigencia.id,
            con_nu_prazo_cancela_inad: infoVigencia.rvc_nu_prazo_cancela_inad,
            prazolimitebloqueio: infoVigencia.prazobloqueio,
            tipocontratoid: 5,
            tipodecarteiraid: tipoCarteiraId,
            motivoadesaoid: MotivoAdesao,
            con_in_renovacao_auto: produto.prd_in_renovaauto,
            importado: 'N',
            localid: 1,
            bloqueadopesquisa: false,
            ...(Parent ? { contrato_parent: Number.parseInt(Parent, 10) } : {}),
            ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
            ...(cartaoCredito ? { cartaoid: cartaoCredito.id } : {}),
            ...(Observacao ? { obs: Observacao } : {}),
          },
          { transaction: t }
        );
      } catch (error) {
        console.log(error);
      }

      await contrato.setResponsavelpf(responsavel, {
        through: {
          planoid: produto.planoid,
          tipocarteiraid: carteirinha.id,
          versaoplanoid: produto.versaoid,
          diavencimento: Number.parseInt(DiaVencimentoMes, 10),
          datavencimento: format(new Date(dataAdesao), formatoData),
          tipodecarteiraid: tipoCarteiraId,
          qtdparcela: qtdParcelas,
          valorcontrato: valorBeneficiarios * infoVigencia.mesesvigencia,
          valormes: (valorBeneficiarios * infoVigencia.mesesvigencia) / qtdParcelas,
          valorliquido: (valorBeneficiarios * infoVigencia.mesesvigencia) / qtdParcelas,
          valordesconto: (valorProdutoSemDesconto - valorBeneficiarios) * infoVigencia.mesesvigencia,
        },
        transaction: t,
      });
    } else if (Number.parseInt(TipoContrato, 10) === 9) {
      contrato = await Contrato.findOne(
        {
          where: {
            statusid: 8,
            tipocontratoid: 9,
            datacancelamento: {
              [Op.is]: null,
            },
          },
        },
        { transaction: t }
      );
    }

    if (!contrato || !(contrato instanceof Contrato)) {
      throw new AppError(500, 'Não foi possível criar ou encontrar o contrato selecionado');
    }

    const grupoFamiliar = await contrato.createGrupofamiliar(
      { responsavelgrupoid: responsavel.id },
      { transaction: t }
    );

    for (const beneficiario of beneficiarios) {
      const tipoBeneficiario = await TipoBeneficiario.findOne({
        where: { codigo: beneficiario.vinculo },
        transaction: t,
      });

      const [{ sequencia }] = await connection.query(
        `
            SELECT ( Max(cn_beneficiario.sequencia) + 1 ) AS sequencia
              FROM   cn_beneficiario
                    INNER JOIN cn_associadopf
                            ON cn_associadopf.id = cn_beneficiario.contratoid
              GROUP  BY cn_beneficiario.planoid,
                        cn_beneficiario.tipobeneficiarioid
              HAVING ( cn_beneficiario.planoid = :plano )
                    AND ( cn_beneficiario.tipobeneficiarioid = :tipo )
            `,
        {
          replacements: { plano: produto.planoid, tipo: tipoBeneficiario.id },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );

      let controleSequencia = sequencia ? Number.parseInt(sequencia, 10) : 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const checarCarteirinha = await Beneficiario.count({
          where: {
            numerocarteira: GerarCarteira({
              operadora: operadoraid,
              sequencia: controleSequencia,
              tipoBeneficiario: tipoBeneficiario.id,
            }),
          },
          transaction: t,
        });

        if (checarCarteirinha !== 0) {
          controleSequencia += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        break;
      }

      const valor = beneficiario.valorProduto || valorPadrao;

      await grupoFamiliar.addPessoa(beneficiario.pessoa, {
        transaction: t,
        through: {
          contratoid: contrato.numerocontrato,
          tipobeneficiarioid: tipoBeneficiario.id,
          dataregistrosistema: new Date(),
          dataadesao: dataAdesao,
          valor,
          numerocarteira: GerarCarteira({
            operadora: operadoraid,
            sequencia: controleSequencia,
            tipoBeneficiario: tipoBeneficiario.id,
          }),
          via: 'A',
          sequencia: controleSequencia,
          ativo: '1',
          responsavelgrupo: responsavel.id,
          descontovalor: beneficiario.valor ? valor - beneficiario.valor : 0,
          descontoporcent: beneficiario.valor ? ((valor - beneficiario.valor) * 100) / valor : 0,
          motivoadesaoid: MotivoAdesao || 268,
          planoid: produto.planoid,
          versaoplanoid: produto.versaoid,
          tipocarteiraid: carteirinha.id,
          ben_in_requerente: false,
          ben_in_cobertura_parcial_tmp: false,
          ben_in_proc_excluidos_cob: false,
          importado: 'N',
          ben_nu_qtd_mes_ativo: 1,
          ben_nu_qtd_ciclo_ativo: 1,
          ...(vendedor ? { corretoraid: vendedor.corretoraid } : {}),
          ...(vendedor ? { vendedorid: vendedor.vendedorid } : {}),
        },
      });
    }

    // Parte Financeira
    if (Number.parseInt(TipoContrato, 10) === 5) {
      // Pessoa Física
      const modalidadePagamento = await ModalidadePagamento.findOne({ where: { id: Modalidade }, transaction: t });
      const quantidadeParcelas = Parcelas || infoVigencia.mesesvigencia;

      if (!modalidadePagamento || !(modalidadePagamento instanceof ModalidadePagamento)) {
        throw new AppError(400, 'É necessário informar uma modalidade de pagamento válida');
      }

      const checarCarteira = await TipoCarteira.findOne({
        where: { id: tipoCarteiraId, modalidadepagamentoid: modalidadePagamento.id },
        transaction: t,
      });

      if (!checarCarteira) {
        throw new AppError(400, 'A carteira não pertence a modalidade escolhida');
      }

      const dataVencimentoTitulo = dataAdesao;

      const titulo = await Titulo.create(
        {
          vinculopessoaid: 4,
          cmfid: 18,
          grupocmfid: 4,
          tipodocumentoid: 1,
          statusid: 1,
          numerocontratoid: contrato.id,
          numerodocumento: contrato.numerocontrato,
          valor: valorBeneficiarios * infoVigencia.mesesvigencia,
          numerototalparcelas: quantidadeParcelas,
          numerodiavencimento: DiaVencimentoMes,
          datavencimento: dataVencimentoTitulo,
          dataperiodoinicial: dataAdesao,
          dataperiodofinal: dataVencimentoTitulo,
          modpagamentoid: modalidadePagamento.id,
          datacadastro: new Date(),
          tipopessoa: 'F',
          pessoaid: responsavel.id,
          pessoausuarioid: 1,
          tipodecarteiraid: checarCarteira.id,
          obs: 'Título gerado apartir da api giga.',
          ciclocontrato: 1,
          ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
        },
        { transaction: t }
      );

      let mesAdicional = 1;
      let j = 1;
      let mesVigencia = quantidadeParcelas;

      if (Pagamentos && DataPagamento) {
        mesVigencia -= 1;

        let dataVencimento = DataVencimento;

        if (!dataVencimento) {
          const dataPagamento = parse(DataPagamento, 'yyyy-MM-dd', new Date());
          const proximoVencimento = addMonths(dataVencimentoMes, 1);
          const margemAplicada = subDays(proximoVencimento, margemAntecipacao);

          if (
            isEqual(dataPagamento, proximoVencimento) ||
            (isBefore(dataPagamento, proximoVencimento) && isAfter(dataPagamento, margemAplicada)) ||
            isEqual(dataPagamento, margemAplicada)
          ) {
            dataVencimento = proximoVencimento;
          } else {
            dataVencimento = dataVencimentoMes;
          }
        }

        await Parcela.create(
          {
            pessoausuarioid: 1,
            tituloid: titulo.id,
            tipodocumentoid: 1,
            numero: j,
            datavencimento: format(new Date(dataVencimento), formatoData),
            datacadastramento: format(new Date(), formatoData),
            statusgrupoid: 1,
            valor: (valorBeneficiarios * infoVigencia.mesesvigencia) / quantidadeParcelas,
            valor_bruto: (valorBeneficiarios * infoVigencia.mesesvigencia) / quantidadeParcelas,
            pcl_in_cobranca: false,
          },
          { transaction: t }
        );

        j += 1;

        if (
          isEqual(dataVencimento, setDate(dataVencimento, DiaVencimentoMes)) ||
          isAfter(dataVencimento, setDate(dataVencimento, DiaVencimentoMes))
        ) {
          mesAdicional += 1;
        }
      }

      for (let i = 1; i <= mesVigencia; i += 1) {
        const dataVencimento = dataAdesao || DataVencimento || DataPagamento || new Date();

        // eslint-disable-next-line no-await-in-loop
        await Parcela.create(
          {
            pessoausuarioid: 1,
            tituloid: titulo.id,
            tipodocumentoid: 1,
            numero: j,
            datavencimento: addMonths(setDate(dataVencimento, DiaVencimentoMes), mesAdicional - 1),
            datacadastramento: format(new Date(), formatoData),
            statusgrupoid: 1,
            valor: (valorBeneficiarios * infoVigencia.mesesvigencia) / quantidadeParcelas,
            valor_bruto: (valorBeneficiarios * infoVigencia.mesesvigencia) / quantidadeParcelas,
            pcl_in_cobranca: false,
          },
          { transaction: t }
        );

        mesAdicional += 1;

        j += 1;
      }

      const parcelas = await titulo.getParcelas({ transaction: t });

      if (Pagamentos) {
        // const firstInstallment = parcelas.sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10))[0];
        const Installment = parcelas.filter((parcela) => parcela.numero <= Pagamentos[0].Parcelas);

        Installment.forEach(async (newParcela) => {
          await BaixarParcelaService.execute({
            transaction: t,
            forma_pagamento: Pagamentos,
            id_parcela: newParcela.id,
            id_contrato: contrato.id,
            ...(Descontos ? { descontos: Descontos } : {}),
            ...(Acrescimos ? { acrescimos: Acrescimos } : {}),
            data_pagamento: DataPagamento || new Date(),
            connection,
          });
        });
      }

      if (modalidadePagamento.id === '7' && !Pagamentos) {
        const primeiraParcela = parcelas[0];

        const enderecos = await responsavel.getEnderecos({ transaction: t });

        const endereco = enderecos && enderecos.length > 0 ? enderecos[0] : null;

        if (!endereco) {
          throw new AppError(400, 'É necessário informar ao menos um endereço para o responsável financeiro');
        }

        const {
          data: { data: boleto },
        } = await axios.post(
          `https://www.idental.com.br/api/bb/${operadora}`,
          {
            TipoTitulo: 1,
            ValorBruto: primeiraParcela.valor,
            DataVencimento: primeiraParcela.datavencimento,
            Pagador: {
              Tipo: 1,
              Nome: ResponsavelFinanceiro.Nome,
              Documento: ResponsavelFinanceiro.CPF,
              Estado: endereco.estado,
              Cidade: endereco.cidade,
              Bairro: endereco.bairro,
              Endereco: endereco.logradouro,
              Cep: endereco.cep,
            },
          },
          { headers: { appAuthorization: 'ff4e09f0-241d-4bbf-85f0-76dd1bd67919' } }
        );

        await Parcela.update(
          {
            linhadigitavel: boleto.linhaDigitavel,
            codigobarras: boleto.codigoBarraNumerico,
            nossonumero: boleto.numero,
          },
          {
            where: {
              id: primeiraParcela.id,
            },
            transaction: t,
          }
        );

        // Enviar boleto
        const responsavelFinanceiroEmail = Emails[0];
        if (responsavelFinanceiroEmail) {
          try {
            await axios.post(
              `https://www.idental.com.br/api/cobranca/${operadora}/send-boleto/email`,
              {
                destinatario: responsavelFinanceiroEmail,
                parcela_id: primeiraParcela.id,
                nome: responsavel.nome,
                nosso_numero: boleto.numero,
                vencimento: primeiraParcela.datavencimento,
              },
              { headers: { appAuthorization: '90b63cf1-4061-49e8-8f99-6f3692fdaa6d' } }
            );
          } catch (error) {
            console.error(error);
          }
        }
      }

      const regraFechamento = await RegraFechamento.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  centrocusto_id: {
                    [Op.is]: null,
                  },
                },
                {
                  centrocusto_id: {
                    [Op.eq]: centroCusto.id,
                  },
                },
              ],
            },
            {
              tipodecarteira_id: {
                [Op.eq]: checarCarteira.id,
              },
            },
          ],
        },
        transaction: t,
      });

      // Verifica se existe alguma regra
      if (regraFechamento && !Averbacao) {
        const closingDay = DataFechamento
          ? setDate(new Date(), DataFechamento)
          : setDate(new Date(), regraFechamento.fechamento); // Peda o dia de fechamento

        const dayOfTheWeek = getDay(closingDay); // Pega o dia da semana do fechamento

        const businessDay = dayOfTheWeek === 0 || dayOfTheWeek === 6 ? subBusinessDays(closingDay, 1) : closingDay; // Seleciona um dia válido
        const vencimento = setDate(new Date(), regraFechamento.vencimento); // Seleciona o Vencimento do fechamento

        if (isAfter(new Date(), businessDay) && isBefore(new Date(), vencimento)) {
          // gerar boleto para a parcela 2
          const secondInstallment = parcelas[1];

          if (!secondInstallment) {
            throw new AppError(500, 'Erro ao gerar parcela');
          }

          const enderecos = await responsavel.getEnderecos({ transaction: t });

          const endereco = enderecos && enderecos.length > 0 ? enderecos[0] : null;

          if (!endereco) {
            throw new AppError(400, 'É necessário informar ao menos um endereço para o responsável financeiro');
          }

          const {
            data: { data: boleto },
          } = await axios.post(
            `https://www.idental.com.br/api/bb/${operadora}`,
            {
              TipoTitulo: 1,
              ValorBruto: secondInstallment.valor,
              DataVencimento: secondInstallment.datavencimento,
              Pagador: {
                Tipo: 1,
                Nome: ResponsavelFinanceiro.Nome,
                Documento: ResponsavelFinanceiro.CPF,
                Estado: endereco.estado,
                Cidade: endereco.cidade,
                Bairro: endereco.bairro,
                Endereco: endereco.logradouro,
                Cep: endereco.cep,
              },
            },
            { headers: { appAuthorization: 'ff4e09f0-241d-4bbf-85f0-76dd1bd67919' } }
          );

          await Parcela.update(
            {
              linhadigitavel: boleto.linhaDigitavel,
              codigobarras: boleto.codigoBarraNumerico,
              nossonumero: boleto.numero,
            },
            {
              where: {
                id: secondInstallment.id,
              },
              transaction: t,
            }
          );
        }
      }
    } else {
      // Pessoa Juridica
      const titulo = await Titulo.findOne({
        where: {
          dataperiodoinicial: {
            [Op.lte]: new Date(),
          },
          dataperiodofinal: {
            [Op.gte]: new Date(),
          },
          statusid: 1,
        },
        include: [{ model: Parcela, as: 'parcelas' }],
        transaction: t,
      });

      const dadosContrato = await AssociadoPJ.findByPk(contrato.id, { transaction: t });

      const parcelasTituloVigentenaoPagas = titulo.parcelas.filter((parcela) => {
        const dataVencimento = parseISO(parcela.datavencimento);

        return parseInt(parcela.statusgrupoid, 10) === 1 && isAfter(dataVencimento, new Date());
      });

      await dadosContrato.update(
        {
          valorcontrato: dadosContrato.valorliquido + valorBeneficiarios * parcelasTituloVigentenaoPagas,
          valorliquido: valorBeneficiarios + dadosContrato.valorliquido,
          valormes: valorBeneficiarios + dadosContrato.valorliquido,
        },
        { transaction: t }
      );

      await Parcela.update(
        {
          valor: dadosContrato.valorliquido + valorBeneficiarios,
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
    }

    // Final
    if (!transaction) t.rollback();

    return { contrato, grupoFamiliar };
  } catch (error) {
    if (!transaction) t.rollback();

    throw error;
  }
};
