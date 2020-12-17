import { Transaction, Sequelize, Op, QueryTypes } from 'sequelize';
import moment from 'moment';
import _ from 'lodash';

import Contrato from '../models/Sequelize/Contrato';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
// import Pessoa from '../models/Sequelize/Pessoa';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import ParcelaAcrescimoDesconto from '../models/Sequelize/ParcelaAcrescimoDesconto';
import LotePagamento from '../models/Sequelize/LotePagamento';
import Produto from '../models/Sequelize/Produto';
import TipoCarteira from '../models/Sequelize/TipoCarteira';
import EstadoCivil from '../models/Sequelize/EstadoCivil';
import CartaoCredito from '../models/Sequelize/CartaoCredito';
import Conta from '../models/Sequelize/Conta';

// import CriaPessoaFisica from './CriaPessoaFisicaService';
// import AdicionarVinculoService from './AdicionarVinculoService';
import BaixarParcelaService from './BaixarParcelaService';
import RemoverBaixaParcelaService from './RemoverBaixaParcelaService';
import CancelarContratoService from './CancelarContratoService';
import CriaContratoService from './CriaContratoService';
import RemoveMembroContratoService from './RemoveMembroContratoService';

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

const TipoVinculo = {
  1: 'TITULAR',
  3: 'CONJUGE',
  4: 'FILHO',
  6: 'ENTEADO',
  8: 'PAI',
  10: 'AGREGADO',
};

export default class MigrarContratoService {
  static async execute({
    connection,
    transaction,
    id_contrato,
    proposta: {
      Beneficiarios,
      // PrazoVigencia,
      Produto: id_produto,
      Corretora,
      Vendedor,
      FormaPagamento,
      Pagamentos,
      Valor,
    },
  }) {
    // Testa se a instancia de conexão com o banco de dados foi passada corretamente
    if (!connection || !(connection instanceof Sequelize)) {
      throw new Error('Não foi possível estabalecer conexão com o banco de dados');
    }

    // Testa se a instancia de transação foi mandada corretamente, caso não, cria uma nova instancia
    if (!transaction || !(transaction instanceof Transaction)) {
      transaction = await connection.transaction();
    }
    try {
      // Seleciona contrato atual ao qual será aplicado a migração
      const contrato = await Contrato.findOne({
        where: {
          id: id_contrato,
          statusid: 8,
          tipocontratoid: { [Op.in]: [5, 9] },
          datacancelamento: { [Op.is]: null },
        },
        include: [
          {
            model: PessoaFisica,
            as: 'responsavel_pessoafisica',
            include: [
              {
                model: CartaoCredito,
                as: 'cartoes',
              },
              {
                model: Conta,
                as: 'contas',
              },
            ],
          },
          { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
          {
            model: Titulo,
            as: 'titulos',
            include: [
              {
                model: Parcela,
                as: 'parcelas',
                include: [
                  { model: ParcelaAcrescimoDesconto, as: 'descontos' },
                  { model: LotePagamento, as: 'lotes' },
                ],
              },
            ],
          },
          {
            model: GrupoFamiliar,
            as: 'gruposfamiliar',
            include: [{ model: PessoaFisica, as: 'beneficiarios' }],
          },
        ],
      });
      // Verifica se o contrato atual existe ou se está ápito para realizar a operação
      if (!contrato) {
        throw new Error('Contrato inexiste, cancelado ou impossibilitado de realizar operação');
      }

      const contratoIsPJ = contrato.tipocontratoid === 9; // Label para verificar se o contrato atual pertence a Pessoa Física ou Pessoa Jurídica
      const rfContrato = contratoIsPJ ? contrato.responsavel_pessoajuridica[0] : contrato.responsavel_pessoafisica[0]; // Armazena as informações do responsável financeiro do contrato atual
      const infoContrato = contratoIsPJ ? rfContrato.AssociadoPJ : rfContrato.AssociadoPF; // Armazena as informações do contrato atual
      const tituloVigenciaContrato = contrato.titulos.find((t) => {
        return t.statusid === 1 && moment().isBefore(t.dataperiodofinal) && moment().isAfter(t.dataperiodoinicial);
      }); // Recupera o último título em vigencia do contrato

      const ultimaParcelaPaga = tituloVigenciaContrato.parcelas
        .filter((p) => p.statusgrupoid === '2')
        .sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10))
        .shift(); // Recura a última parcela paga

      // const proximaParcela = tituloVigenciaContrato.parcelas
      //   .filter(
      //     (p) =>
      //       p.statusgrupoid === '1' &&
      //       moment(p.datavencimento).isAfter(moment()) &&
      //       p.descontos.length === 0 &&
      //       p.lotes.length === 0
      //   )
      //   .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
      //   .shift(); // Recupera a próxima parcela a ser paga

      // Verificar parcelas em atraso
      // const parcelasEmAtraso = _.flattenDeep(contrato.titulos.map((t) => t.parcelas)).filter(
      //   (p) => p.statusgrupoid === '1' && moment().isAfter(p.datavencimento)
      // );

      // Verifica se o contrato é adimplente
      // if (parcelasEmAtraso) {
      //   throw new Error('Contrato Inadimplente');
      // }

      const beneficiariosContrato = _.flattenDeep(contrato.gruposfamiliar.map(({ beneficiarios }) => beneficiarios)); // Armazena beneficiarios do contrato atual

      // Testa se o contrato tem algum titulo em vigencia (ativo)
      if (!tituloVigenciaContrato) {
        throw new Error(
          'Não é possível completar a operação, pois, o contrato escolhido não possui títulos em vigencia'
        );
      }

      let valorProposta = 0; // Armazena o valor total da proposta
      const beneficiariosProposta = []; // Armazena os beneciarios da proposta

      // Seleciona o produto da proposta
      const produtoProposta = await Produto.findOne({
        where: {
          id: id_produto,
          pro_id_tipo_contrato: contrato.tipocontratoid,
        },
      });

      // Verifica se o produto ao qual pretende migrar, é o mesmo que ele já se encontra
      // if (produtoProposta.planoid === infoContrato.planoid && produtoProposta.versaoid === infoContrato.versaoplanoid) {
      //   throw new Error('Não é possível realizar a migração para um plano com o mesmo produto e versão');
      // }

      // Verifica se o produto está disponível para aquele tipo de contrato, caso não esteja, retorna um erro
      if (!produtoProposta) {
        throw new Error('Produto inexistente ou indisponível para o tipo de contrato selecionado');
      }

      // Verifica se foi informado os beneficiários que irão migrar
      if (!Beneficiarios) {
        // Caso não tenha sido informado, considera a migração de todos os beneficiários do plano antigo

        // eslint-disable-next-line no-restricted-syntax
        for (const beneficiario of beneficiariosContrato) {
          // Seleciona Valor do Plano
          const [{ valor: valorPlano }] = await connection.query(
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
                P_ID_TIPOBENEFICIARIO: beneficiario.Beneficiario.tipobeneficiarioid,
                P_ID_PLANO: produtoProposta.planoid,
                P_ID_VERSAO: produtoProposta.versaoid,
                P_DT_ADESAO_BENEF: new Date(),
              },
            }
          );

          // incrementa valor ao valor da proposta
          valorProposta += parseFloat(Valor) || parseFloat(valorPlano);

          beneficiariosProposta.push({
            beneficiario,
            cpf: beneficiario.cpf,
            valor: parseFloat(Valor) || parseFloat(valorPlano),
          });
        }
      } else {
        // const formatarBeneficiarios = Beneficiarios.map(
        //   ({
        //     Nome: nome,
        //     RG: rg,
        //     CPF: cpf,
        //     DataNascimento: datanascimento,
        //     Sexo: sexo,
        //     OrgaoEmissor: orgaoemissor,
        //     NomeDaMae: nomedamae,
        //     Nacionalidade: nacionalidade,
        //     EstadoCivil: estadocivil,
        //     Vinculo,
        //   }) => ({
        //     pessoa: { nome, rg, cpf, datanascimento, sexo, orgaoemissor, nomedamae, nacionalidade, estadocivil },
        //     vinculo: bv[Vinculo],
        //   })
        // );

        // eslint-disable-next-line no-restricted-syntax
        for (const beneficiario of Beneficiarios) {
          // eslint-disable-next-line no-await-in-loop
          const tipoBeneficiario = await TipoBeneficiario.findOne({
            where: { codigo: bv[beneficiario.Vinculo || 'OUTROS'] },
          }); // Seleciona o tipo de beneficiario para fazer a cotação do valor do plano

          // Seleciona o valor do plano para aquele beneficiario
          const [{ valor: valorPlano }] = await connection.query(
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
                P_ID_TIPOBENEFICIARIO: tipoBeneficiario.id,
                P_ID_PLANO: produtoProposta.planoid,
                P_ID_VERSAO: produtoProposta.versaoid,
                P_DT_ADESAO_BENEF: beneficiario.DataAdesao || new Date(), // Se a data de adesão não for informada, considerará a data atual
              },
            }
          );

          // Incrementa no valor da proposta o valor do beneficiário
          valorProposta += parseFloat(beneficiario.Valor) || parseFloat(Valor) || parseFloat(valorPlano);

          // Cria nova pessoa caso ela não tenha sido criada
          // const pessoa = await CriaPessoaFisica.execute({ ...beneficiario.pessoa, transaction }); // Cria ou Seleciona pessoa, independente dela fazer parte do contrato
          const verifyBeneficiario = beneficiariosContrato.find(({ cpf }) => cpf === beneficiario.CPF); // Seleciona pessoa caso ela pertença ao contrato

          if (verifyBeneficiario) {
            // const pessoa = await Pessoa.findByPk(verifyBeneficiario.id);

            // Adiciona o vinculo de pessoa física caso o beneficiario não tenha o vinculo
            // await AdicionarVinculoService.execute({
            //   atributos: beneficiario,
            //   pessoa,
            //   sequelize: connection,
            //   transaction,
            //   vinculo: bv.PESSOA_FISICA,
            // });

            // Adiciona os novos vinculos a pessoa, caso ela não tenha os vínculos
            // await AdicionarVinculoService.execute({
            //   atributos: {
            //     ...beneficiario,
            //   },
            //   pessoa,
            //   sequelize: connection,
            //   transaction,
            //   vinculo: formatarBeneficiarios.length > 1 ? bv[beneficiario.Vinculo || 'OUTROS'] : bv.TITULAR,
            // });

            // Empurra os beneficiarios para o array de proposta
            beneficiariosProposta.push({
              beneficiario: verifyBeneficiario,
              cpf: verifyBeneficiario.cpf,
              beneficiarioSend: beneficiario,
              valor: parseFloat(beneficiario.Valor) || parseFloat(Valor) || parseFloat(valorPlano),
            });
          }
        }
      }
      // Verifica se existem beneficiários para efetuar a migração
      if (!beneficiariosProposta || beneficiariosProposta.length === 0) {
        throw new Error('É necessário selecionar beneficiários do contrato para realizar a migração');
      }

      const beneficiariosNaoInclusos = _.differenceBy(beneficiariosContrato, beneficiariosProposta, 'cpf');

      const formatarBeneficiraiosSubmit = beneficiariosProposta.map((b) => ({
        ...(Beneficiarios ? { ...b.beneficiarioSend } : {}),
        Nome: b.beneficiario.nome,
        Vinculo: TipoVinculo[b.beneficiario.Beneficiario.tipobeneficiarioid],
        TipoVinculoID: b.beneficiario.Beneficiario.tipobeneficiarioid,
        Valor: b.valor,
        RG: b.beneficiario.rg,
        CPF: b.beneficiario.cpf,
        DataNascimento: b.beneficiario.datanascimento,
        Sexo: b.beneficiario.sexo,
        OrgaoEmissor: b.beneficiario.orgaoemissor,
        Nacionalidade: b.beneficiario.nacionalidade,
      }));

      const valorPropostaFinal =
        valorProposta +
        beneficiariosNaoInclusos.reduce(
          (ant, pos) => ant + parseFloat(pos.Beneficiario.valor - pos.Beneficiario.descontovalor),
          0
        );

      let baixaPrimeiraParcelaProposta = false;

      // Verifica se o valor do plano é maior que o valor já pago
      if (valorPropostaFinal > infoContrato.valormes) {
        if (!FormaPagamento) {
          throw new Error(
            'É necessário informar o valor pago de diferença ou integral, para efetuar a migração do contrato.'
          );
        }

        const diffParcela = Math.abs(moment().diff(ultimaParcelaPaga.datavencimento, 'days'));
        let valorPago = 0;
        if (diffParcela > 20) {
          valorPago = valorPropostaFinal;
          baixaPrimeiraParcelaProposta = true;
        } else {
          valorPago = valorPropostaFinal - infoContrato.valormes;

          // Remove Baixa de ultima parcela paga
          await RemoverBaixaParcelaService.execute({ transaction, connection, id_parcela: ultimaParcelaPaga.id });

          // Baixa a parcela com o novo valor
          await BaixarParcelaService.execute({
            transaction,
            connection,
            id_parcela: ultimaParcelaPaga.id,
            data_pagamento: new Date(),
            id_contrato: contrato.id,
            forma_pagamento: Pagamentos,
            acrescimos: { CMFID: 1, Valor: valorPago },
          });
        }
      }
      const estadoCivilRF = await EstadoCivil.findByPk(rfContrato.estadocivilid);
      const tipoDeCarteiraRF = await TipoCarteira.findByPk(contrato.tipodecarteiracontratoid);

      const cartaoRF = rfContrato.cartoes ? rfContrato.cartoes.find((c) => c.car_in_principal) : null;
      const contaRF = rfContrato.contas ? rfContrato.contas.find((c) => c.con_in_principal) : null;

      if (beneficiariosNaoInclusos.length > 1) {
        const checkTitular = beneficiariosProposta.find((b) => b.beneficiario.Beneficiario.tipobeneficiarioid === '1');
        if (checkTitular) {
          // Formata beneficiarios não inclusos
          const formataBeneficiariosNaoInclusos = beneficiariosNaoInclusos.map((b) => ({
            Nome: b.nome,
            Vinculo: TipoVinculo[b.Beneficiario.tipobeneficiarioid],
            TipoVinculoID: b.Beneficiario.tipobeneficiarioid,
            Valor: b.Beneficiario.valor,
            RG: b.rg,
            CPF: b.cpf,
            DataNascimento: b.datanascimento,
            Sexo: b.sexo,
            OrgaoEmissor: b.orgaoemissor,
            Nacionalidade: b.nacionalidade,
          }));
          // Sorteia um novo titular
          formataBeneficiariosNaoInclusos[0].Vinculo = 'TITULAR';
          formataBeneficiariosNaoInclusos[0].Titular = true;
          const oldTitular = beneficiariosContrato.find((b) => b.Beneficiario.tipobeneficiarioid === '1');
          const oldProduto = await Produto.findOne({
            where: {
              planoid: oldTitular.Beneficiario.planoid,
              versaoid: oldTitular.Beneficiario.versaoplanoid,
            },
          });
          // Cria contrato similar ao antigo
          await CriaContratoService.execute({
            sequelize: connection,
            transaction,
            alterarVinculo: false,
            formValidation: {
              TipoContrato: contrato.tipocontratoid,
              Vendedor,
              Corretora,
              Produto: oldProduto.id,
              ResponsavelFinanceiro: {
                TipoPessoa: 'F',
                Nome: rfContrato.nome,
                RG: rfContrato.rg,
                CPF: rfContrato.cpf,
                DataNascimento: rfContrato.datanascimento,
                Sexo: rfContrato.sexo,
                EstadoCivil: estadoCivilRF.descricao,
                OrgaoEmissor: rfContrato.orgaoemissor,
                Nacionalidade: rfContrato.nacionalidade,
                NomeDaMae: rfContrato.nomedamae,
              },
              FormaPagamento: {
                TipoCarteira: contrato.tipodecarteiracontratoid,
                DiaVencimentoMes: infoContrato.diavencimento,
                Modalidade: tipoDeCarteiraRF.modalidadepagamentoid,
                CartaoCredito: {
                  Numero: cartaoRF ? cartaoRF.numerocartao : null,
                  CodigoSeguranca: cartaoRF ? cartaoRF.codigosegurancacartao : null,
                  TipoCartao: cartaoRF ? cartaoRF.tipocartaoid : null,
                  Validade: cartaoRF ? cartaoRF.validadedecartao : null,
                  Titular: cartaoRF ? cartaoRF.nome_titular : null,
                  Principal: true,
                },
                Conta: {
                  TipoConta: contaRF ? contaRF.tipocontaid : null,
                  Operacao: contaRF ? contaRF.operacao : null,
                  Agencia: contaRF ? contaRF.agenciaid : null,
                  Digito: contaRF ? contaRF.digito : null,
                  Numero: contaRF ? contaRF.numero : null,
                  Principal: true,
                },
              },
              Beneficiarios: formataBeneficiariosNaoInclusos,
            },
          });
          // Cancela contrato antigo
          await CancelarContratoService.execute({ transaction, sequelize: connection, id: contrato.id });
        } else {
          // Remove beneficiarios que estão migrando de plano
          // eslint-disable-next-line no-restricted-syntax
          for (const b of beneficiariosProposta) {
            await RemoveMembroContratoService.execute({
              id_beneficiario: b.beneficiario.id,
              id_contrato: contrato.id,
              sequelize: connection,
              transaction,
            });
          }
        }
      } else {
        await CancelarContratoService.execute({ transaction, sequelize: connection, id: contrato.id });
      }

      const newContrato = await CriaContratoService.execute({
        sequelize: connection,
        transaction,
        alterarVinculo: false,
        formValidation: {
          TipoContrato: 9,
          Vendedor,
          Corretora,
          Produto: produtoProposta.id,
          ResponsavelFinanceiro: {
            TipoPessoa: 'F',
            Nome: rfContrato.nome,
            RG: rfContrato.rg,
            CPF: rfContrato.cpf,
            DataNascimento: rfContrato.datanascimento,
            Sexo: rfContrato.sexo,
            EstadoCivil: estadoCivilRF.descricao,
            OrgaoEmissor: rfContrato.orgaoemissor,
            Nacionalidade: rfContrato.nacionalidade,
            NomeDaMae: rfContrato.nomedamae,
          },
          FormaPagamento: {
            TipoCarteira: contrato.tipodecarteiracontratoid,
            DiaVencimentoMes: infoContrato.diavencimento,
            Modalidade: tipoDeCarteiraRF.modalidadepagamentoid,
            CartaoCredito: {
              Numero: cartaoRF.numerocartao,
              CodigoSeguranca: cartaoRF.codigosegurancacartao,
              TipoCartao: cartaoRF.tipocartaoid,
              Validade: cartaoRF.validadedecartao,
              Titular: cartaoRF.nome_titular,
              Principal: true,
            },
            Conta: {
              TipoConta: contaRF.tipocontaid,
              Operacao: contaRF.operacao,
              Agencia: contaRF.agenciaid,
              Digito: contaRF.digito,
              Numero: contaRF.numero,
              Principal: true,
            },
          },
          Beneficiarios: formatarBeneficiraiosSubmit,
        },
      });

      if (baixaPrimeiraParcelaProposta) {
        const responseContrato = await Contrato.findOne({
          where: {
            id: newContrato.id,
          },
          include: [{ model: Titulo, as: 'titulos', include: [{ model: Parcela, as: 'parcelas' }] }],
        });

        await BaixarParcelaService.execute({
          id_contrato: newContrato.id,
          connection,
          transaction,
          forma_pagamento: Pagamentos,
          id_parcela: responseContrato.titulos[0].parcelas[0].id,
        });
      }
      transaction.commit();
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }
}
