/* eslint-disable default-case */
import { QueryTypes, Sequelize, Transaction, Op } from 'sequelize';
import { subBusinessDays, parseISO, getDay, setDate, isAfter, isBefore, format } from 'date-fns';
import moment from 'moment';

import axios from 'axios';
import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import ModalidadePagamento from '../models/Sequelize/ModalidadePagamento';
import RegraFechamento from '../models/Sequelize/RegraFechamento';
// import Telefone from '../models/Sequelize/Telefone';
// import Email from '../models/Sequelize/Email';
// import Endereco from '../models/Sequelize/Endereco';
import CentroCusto from '../models/Sequelize/CentroCusto';
import Produto from '../models/Sequelize/Produto';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';
import BeneficiarioModels from '../models/Sequelize/Beneficiario';

import Parcela from '../models/Sequelize/Parcela';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

import GeraCarteira from '../helpers/GerarCarteira';

import AdicionarVinculoService from './AdicionarVinculoService';

import CriaPessoaFisicaService from './CriaPessoaFisicaService';

import AdicionarEmailService from './AdicionarEmailService';
import AdicionarEnderecoService from './AdicionarEnderecoService';
import AdicionarTelefoneService from './AdicionarTelefoneService';
import AdicionarCartaoCreditoService from './AdicionarCartaoCreditoService';
import AdicionarContaService from './AdicionarContaService';
import BaixarParcelaService from './BaixarParcelaService';

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

export default class CriaContratoService {
  static async execute({ formValidation: body, sequelize, transaction, alterarVinculo = true, operadora = 'idental' }) {
    let t = transaction;
    // Testa se a instancia de conexão com o banco de dados foi passada corretamente
    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new Error('Não foi possível estabalecer conexão com o banco de dados');
    }

    // Testa se a instancia de transação foi mandada corretamente, caso não, cria uma nova instancia
    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }
    try {
      switch (body.Convenio) {
        case 'Empresa':
          // eslint-disable-next-line no-undef
          CriarContratoEmpresa(body);
          return true;
        default: {
          let statusContrato = 8;

          if (!body.Pagamentos) {
            statusContrato = 62;
          }

          let dataAdesao = null;

          if (statusContrato === 62) {
            if (
              moment().isSame(moment().set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10))) ||
              moment().isAfter(moment().set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10)))
            ) {
              dataAdesao = moment(
                moment().set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10)).add(1, 'month')
              ).format('YYYY-MM-DD');
            } else {
              dataAdesao = moment(moment().set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10))).format(
                'YYYY-MM-DD'
              );
            }
          } else if (body.Pagamentos && body.DataPagamento) {
            dataAdesao = body.DataPagamento;
          }

          dataAdesao = body.DataPagamento || dataAdesao || body.DataAdesao;

          /**
           * Seleciona o Produto
           */
          const produto = await Produto.findOne({
            where: {
              id: body.Produto,
              pro_id_tipo_contrato: body.TipoContrato,
            },
            transaction: t,
          });

          // Verifica se o Produto existe
          if (!produto)
            throw new Error('Produto selecionado não encontrado ou está indisponível para o tipo contrato selecionado');

          // Seleciona o centro custo
          const centroCusto = body.CentroCusto
            ? await CentroCusto.findByPk(body.CentroCusto, { transaction: t })
            : await CentroCusto.findByPk(194, { transaction: t });

          // Verifica se Centro custo não existe
          if (!centroCusto && body.Convenio !== 'Pessoa Fisica')
            throw new Error('Centro Custo informado não encontrado');

          /**
           * Validando vendedor
           */
          let vendedor;

          if (body.Vendedor) {
            const [row] = await sequelize.query(
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
                replacements: { vendedorid: body.Vendedor, corretoraid: body.Corretora },
                transaction: t,
              }
            );

            if (!row) throw new Error('Vendedor não encontrado em nosso banco de dados');

            vendedor = row;
          }
          /**
           * Cria o responsavel financeiro
           */
          const responsavelFinanceiro = await CriaPessoaFisicaService.execute({
            usuario: 'N',
            nome: body.ResponsavelFinanceiro.Nome,
            rg: body.ResponsavelFinanceiro.RG,
            cpf: body.ResponsavelFinanceiro.CPF,
            datanascimento: body.ResponsavelFinanceiro.DataNascimento,
            sexo: body.ResponsavelFinanceiro.Sexo,
            orgaoemissor: body.ResponsavelFinanceiro.OrgaoEmissor,
            nomedamae: body.ResponsavelFinanceiro.NomeDaMae,
            nacionalidade: body.ResponsavelFinanceiro.Nacionalidade,
            estadocivil: body.ResponsavelFinanceiro.EstadoCivil,
            sequelize,
            transaction: t,
          });

          const responsavelIsTitular = !!body.Beneficiarios.find(
            ({ CPF, Titular }) => CPF === body.ResponsavelFinanceiro.CPF && Titular
          );

          await responsavelFinanceiro.addOrganogramas(centroCusto, { transaction: t });

          await responsavelFinanceiro.setTiposcontrato([body.TipoContrato], { transaction: t });

          // const responsavelFinanceiroIsBeneficiario = !!body.Beneficiarios.find(
          //   (ben) => ben.CPF === body.ResponsavelFinanceiro.CPF
          // );

          await AdicionarVinculoService.execute({
            pessoa: responsavelFinanceiro,
            vinculo: bv.PESSOA_FISICA,
            atributos: {
              ...body.ResponsavelFinanceiro,
              DataDeNascimento: body.ResponsavelFinanceiro.DataNascimento,
              NºDaMatricula: body.ResponsavelFinanceiro.Matricula,
            },
            alteravel: alterarVinculo,
            sequelize,
            transaction: t,
          });

          await AdicionarVinculoService.execute({
            pessoa: responsavelFinanceiro,
            vinculo: bv.REPONSAVEL_FINANCEIRO,
            atributos: {
              ...body.ResponsavelFinanceiro,
              DataDeNascimento: body.ResponsavelFinanceiro.DataNascimento,
              NºDaMatricula: body.ResponsavelFinanceiro.Matricula,
            },
            alteravel: alterarVinculo,
            sequelize,
            transaction: t,
          });

          if (body.Convenio === 'Municipio') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_MUNICIPAL,
              alteravel: alterarVinculo,
              atributos: {
                ...body.ResponsavelFinanceiro,
                DataDeNascimento: body.ResponsavelFinanceiro.DataNascimento,
                NºDaMatricula: body.ResponsavelFinanceiro.Matricula,
              },
              sequelize,
              transaction: t,
            });
          }

          if (body.Convenio === 'Estado') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_ESTADUAL,
              alteravel: alterarVinculo,
              atributos: {
                ...body.ResponsavelFinanceiro,
                DataDeNascimento: body.ResponsavelFinanceiro.DataNascimento,
                NºDaMatricula: body.ResponsavelFinanceiro.Matricula,
              },
              sequelize,
              transaction: t,
            });
          }

          if (body.Convenio === 'Federal') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_FEDERAL,
              alteravel: alterarVinculo,
              atributos: {
                ...body.ResponsavelFinanceiro,
                DataDeNascimento: body.ResponsavelFinanceiro.DataNascimento,
                NºDaMatricula: body.ResponsavelFinanceiro.Matricula,
              },
              sequelize,
              transaction: t,
            });
          }

          if (body.ResponsavelFinanceiro.Enderecos) {
            await Promise.all(
              body.ResponsavelFinanceiro.Enderecos.map((endereco) =>
                // eslint-disable-next-line no-await-in-loop
                // eslint-disable-next-line no-return-await
                AdicionarEnderecoService.execute({
                  bairro: endereco.Bairro,
                  cidade: endereco.Cidade,
                  estado: endereco.Estado,
                  logradouro: endereco.Logradouro,
                  complemento: endereco.Complemento,
                  numero: endereco.Numero,
                  cep: endereco.Cep,
                  end_in_principal: endereco.Principal,
                  pessoa: responsavelFinanceiro,
                  sequelize,
                  tipoenderecoid: endereco.TipoEndereco || 1,
                  vinculoid: responsavelIsTitular ? bv.TITULAR : bv.REPONSAVEL_FINANCEIRO,
                  transaction: t,
                })
              )
            );

            // await responsavelFinanceiro.setEnderecos(enderecos, { transaction: t });
          }

          if (body.ResponsavelFinanceiro.Telefones) {
            await Promise.all(
              body.ResponsavelFinanceiro.Telefones.map((tel) =>
                AdicionarTelefoneService.execute({
                  numero: tel.Numero,
                  ramal: tel.Ramal,
                  tel_in_principal: tel.Principal,
                  vinculoid: responsavelIsTitular ? bv.TITULAR : bv.REPONSAVEL_FINANCEIRO,
                  tipotelefoneid: tel.TipoTelefone || 3,
                  pessoa: responsavelFinanceiro,
                  sequelize,
                  transaction: t,
                })
              )
            );

            // eslint-disable-next-line no-await-in-loop
            // await responsavelFinanceiro.addTelefones(telefones, { transaction: t });
          }

          if (body.ResponsavelFinanceiro.Emails) {
            await Promise.all(
              body.ResponsavelFinanceiro.Emails.map((email) =>
                AdicionarEmailService.execute({
                  ema_in_principal: email.Principal,
                  dadosid: responsavelFinanceiro.id,
                  vinculoid: responsavelIsTitular ? bv.TITULAR : bv.REPONSAVEL_FINANCEIRO,
                  pessoa: responsavelFinanceiro,
                  email: email.Email,
                  sequelize,
                  tipoemail: email.TipoEmail || 3,
                  transaction: t,
                })
              )
            );

            // responsavelFinanceiro.addEmails(emails, { transaction: t });
          }

          let cartaoCredito = null;

          if (body.FormaPagamento.CartaoCredito) {
            cartaoCredito = await AdicionarCartaoCreditoService.execute({
              pessoa: responsavelFinanceiro,
              transaction: t,
              sequelize,
              car_in_principal: body.FormaPagamento.CartaoCredito.Principal,
              codigosegurancacartao: body.FormaPagamento.CartaoCredito.CodigoSeguranca,
              diadevencimento: body.FormaPagamento.CartaoCredito.DiaVencimento,
              nome_titular: body.FormaPagamento.CartaoCredito.Titular,
              numerocartao: body.FormaPagamento.CartaoCredito.Numero,
              tipocartaoid: body.FormaPagamento.CartaoCredito.TipoCartao,
              validadecartao: body.FormaPagamento.CartaoCredito.Validade,
            });
          }

          if (body.FormaPagamento.Conta) {
            await AdicionarContaService.execute({
              pessoa: responsavelFinanceiro,
              transaction: t,
              sequelize,
              con_in_principal: body.FormaPagamento.Conta.Principal,
              agenciaid: body.FormaPagamento.Conta.Agencia,
              digito: body.FormaPagamento.Conta.Digito,
              numero: body.FormaPagamento.Conta.Numero,
              operacao: body.FormaPagamento.Conta.Operacao,
              tipocontaid: body.FormaPagamento.Conta.TipoConta,
              identificacao: body.FormaPagamento.Conta.Identificacao,
            });
          }

          /**
           * Seleciona id do contrato através do Nextval
           */
          const [{ id: contratoid }] = await sequelize.query("SELECT NEXTVAL('cn_contrato_id_seq') as id", {
            type: QueryTypes.SELECT,
            transaction: t,
          });

          // contratoid = contratoid.shift().id;

          /**
           * Seleciona a regra de Vigencia do Contrato
           */
          const [
            infoVigencia,
          ] = await sequelize.query(
            'SELECT * FROM cn_regravigenciacontrato WHERE rvc_ds_vigencia_contrato ILIKE :vigencia LIMIT 1',
            { replacements: { vigencia: body.PrazoVigencia }, type: QueryTypes.SELECT, transaction: t }
          );

          const [{ operadoraid }] = await sequelize.query(
            'SELECT pessoaoperadoraid as operadoraid FROM configuracao_sistema',
            {
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );

          /**
           * Cria o Contrato
           */
          const contrato = await Contrato.create(
            {
              id: contratoid,
              numerocontrato: contratoid.toString().padStart(10, '0'),
              operadoraid,
              statusid: statusContrato,
              dataadesao: dataAdesao,
              datainicialvigencia: dataAdesao,
              datafinalvigencia: moment(body.FormaPagamento.DiaVencimentoMes, 'DD')
                .add(infoVigencia.mesesvigencia - 1, 'months')
                .format(),
              dataregistrosistema: moment().format(),
              ciclovigenciacontrato: 1,
              quantidadedemesesvigencia: infoVigencia.mesesvigencia,
              con_id_regra_vigencia: infoVigencia.id,
              con_nu_prazo_cancela_inad: infoVigencia.rvc_nu_prazo_cancela_inad,
              prazolimitebloqueio: infoVigencia.prazobloqueio,
              obs: body.Observacao,
              tipocontratoid: 5,
              ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
              tipodecarteiraid: body.FormaPagamento.TipoCarteira,
              motivoadesaoid: body.MotivoAdesao,
              con_in_renovacao_auto: body.RenovacaoAutomatica,
              importado: 'N',
              contrato_parent: body.Parent || null,
              localid: 1,
              ...(cartaoCredito ? { cartaoid: cartaoCredito.id } : {}),
              bloqueadopesquisa: false,
            },
            { transaction: t }
          );

          const carteirinha = await sequelize.query('SELECT * FROM cn_tipocarteira LIMIT 1', {
            type: QueryTypes.SELECT,
            plain: true,
            transaction: t,
          });

          const beneficiarios = [];

          const beneficiarioTitular = body.Beneficiarios.find((ben) => ben.Titular) || body.Beneficiarios[0];

          if (!beneficiarioTitular) throw new Error('É necessário ter um beneficiário titular');

          // eslint-disable-next-line no-restricted-syntax
          for (const beneficiario of body.Beneficiarios) {
            // eslint-disable-next-line no-await-in-loop
            const [valor] = await sequelize.query(
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

            // eslint-disable-next-line no-await-in-loop
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
              sequelize,
              transaction: t,
            });

            await pessoa.setTiposcontrato([body.TipoContrato], { transaction: t });

            // eslint-disable-next-line no-await-in-loop
            await pessoa.addOrganogramas([centroCusto], { transaction: t });

            // eslint-disable-next-line no-await-in-loop
            await AdicionarVinculoService.execute({
              atributos: {
                ...beneficiario,
                ...(!beneficiarioTitular.RG ? {} : { RgDoBeneficiarioTitular: beneficiarioTitular.RG }),
                ...(!beneficiarioTitular.DataNascimento
                  ? {}
                  : { DataDeNascimento: beneficiarioTitular.DataNascimento }),
                ...(!beneficiarioTitular.Matricula ? {} : { NºDaMatricula: beneficiarioTitular.Matricula }),
              },
              pessoa,
              sequelize,
              alteravel: alterarVinculo,
              transaction: t,
              vinculo: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
            });

            if (beneficiario.Enderecos && Array.isArray(beneficiario.Enderecos) && beneficiario.Enderecos.length > 0) {
              // eslint-disable-next-line no-await-in-loop
              await Promise.all(
                beneficiario.Enderecos.map((endereco) =>
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
                    sequelize,
                    transaction: t,
                  })
                )
              );
            } else if (body.ResponsavelFinanceiro.Enderecos) {
              await Promise.all(
                body.ResponsavelFinanceiro.Enderecos.map((endereco) =>
                  // eslint-disable-next-line no-await-in-loop
                  // eslint-disable-next-line no-return-await
                  AdicionarEnderecoService.execute({
                    bairro: endereco.Bairro,
                    cidade: endereco.Cidade,
                    estado: endereco.Estado,
                    logradouro: endereco.Logradouro,
                    complemento: endereco.Complemento,
                    numero: endereco.Numero,
                    cep: endereco.Cep,
                    end_in_principal: endereco.Principal,
                    pessoa,
                    sequelize,
                    tipoenderecoid: endereco.TipoEndereco || 1,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
                    transaction: t,
                  })
                )
              );
            }

            if (beneficiario.Telefones && Array.isArray(beneficiario.Telefones) && beneficiario.Telefones.length > 0) {
              // eslint-disable-next-line no-await-in-loop
              await Promise.all(
                beneficiario.Telefones.map((tel) =>
                  AdicionarTelefoneService.execute({
                    numero: tel.Numero,
                    ramal: tel.Ramal,
                    tel_in_principal: tel.Principal,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
                    tipotelefoneid: tel.TipoTelefone || 3,
                    pessoa,
                    sequelize,
                    transaction: t,
                  })
                )
              );
            } else if (body.ResponsavelFinanceiro.Telefones) {
              await Promise.all(
                body.ResponsavelFinanceiro.Telefones.map((tel) =>
                  AdicionarTelefoneService.execute({
                    numero: tel.Numero,
                    ramal: tel.Ramal,
                    tel_in_principal: tel.Principal,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
                    tipotelefoneid: tel.TipoTelefone || 3,
                    pessoa,
                    sequelize,
                    transaction: t,
                  })
                )
              );
            }

            if (beneficiario.Emails && Array.isArray(beneficiario.Emails) && beneficiario.Emails.length > 0) {
              // eslint-disable-next-line no-await-in-loop
              await Promise.all(
                beneficiario.Emails.map((email) =>
                  AdicionarEmailService.execute({
                    ema_in_principal: email.Principal,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
                    email: email.Email,
                    pessoa,
                    sequelize,
                    tipoemail: email.TipoEmail || 3,
                    transaction: t,
                  })
                )
              );
            } else if (body.ResponsavelFinanceiro.Emails) {
              await Promise.all(
                body.ResponsavelFinanceiro.Emails.map((email) =>
                  AdicionarEmailService.execute({
                    ema_in_principal: email.Principal,
                    dadosid: pessoa.id,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
                    pessoa,
                    email: email.Email,
                    sequelize,
                    tipoemail: email.TipoEmail || 3,
                    transaction: t,
                  })
                )
              );
            }

            beneficiarios.push({
              pessoa,
              vinculo: beneficiario.Titular ? bv.TITULAR : parseInt(beneficiario.Vinculo, 10),
              valor: valor ? valor.valor : null,
              valorLiquido: beneficiario.Valor,
              motivoAdesao: beneficiario.MotivoAdesao,
              dataAdesao: beneficiario.DataAdesao,
            });
          }

          const [{ valor: defaultValor }] = await sequelize.query(
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
                P_ID_TIPOBENEFICIARIO: 4,
                P_ID_PLANO: produto.planoid,
                P_ID_VERSAO: produto.versaoid,
                P_DT_ADESAO_BENEF: dataAdesao,
              },
              transaction: t,
            }
          );

          const valorContratobruto = beneficiarios.reduce((ant, pos) => {
            return ant + (pos.valor || pos.valorLiquido || defaultValor);
          }, 0);

          const valorContratoLiquido = beneficiarios.reduce(
            (ant, pos) => ant + (pos.valorLiquido || pos.valor || defaultValor),
            0
          );

          const qtdParcelas = body.FormaPagamento.Parcelas || infoVigencia.mesesvigencia;

          await contrato.setResponsavelpf(responsavelFinanceiro, {
            through: {
              planoid: produto.planoid,
              tipocarteiraid: carteirinha.id,
              versaoplanoid: produto.versaoid,
              diavencimento: parseInt(body.FormaPagamento.DiaVencimentoMes, 10),
              datavencimento: body.DataVencimento
                ? moment(body.DataVencimento).format()
                : moment(body.FormaPagamento.DiaVencimentoMes, 'DD').format(),
              tipodecarteiraid: body.TipoCarteira,
              qtdparcela: qtdParcelas,
              valorcontrato: valorContratoLiquido * infoVigencia.mesesvigencia,
              valormes: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
              valorliquido: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
              valordesconto: (valorContratobruto - valorContratoLiquido) * infoVigencia.mesesvigencia,
            },
            transaction: t,
          });

          const grupoFamiliar = await contrato.createGrupofamiliar(
            { responsavelgrupoid: responsavelFinanceiro.id },
            { transaction: t }
          );

          const pessoaBeneficiarioTitular = beneficiarios.find((b) => b.vinculo === bv.TITULAR) || beneficiarios[0];

          // eslint-disable-next-line no-restricted-syntax
          for (const ben of beneficiarios) {
            // eslint-disable-next-line no-await-in-loop
            const tipoBeneficiario = await TipoBeneficiario.findOne({ where: { codigo: ben.vinculo }, transaction: t });

            // eslint-disable-next-line no-await-in-loop
            const [{ sequencia }] = await sequelize.query(
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

            let sequenciaCorrect = sequencia ? parseInt(sequencia, 10) : 1;

            while (true) {
              console.log(`estou aqui ${sequenciaCorrect}`);
              const existsCarteirinha = await BeneficiarioModels.count(
                {
                  where: {
                    numerocarteira: GeraCarteira({
                      operadora: operadoraid,
                      sequencia: sequenciaCorrect,
                      tipoBeneficiario: tipoBeneficiario.id,
                    }),
                  },
                  transaction: t,
                },
                { transaction: t }
              );

              if (existsCarteirinha !== 0) {
                sequenciaCorrect += 1;
                // eslint-disable-next-line no-continue
                continue;
              }
              break;
            }

            const valor = ben.valor || defaultValor;
            // eslint-disable-next-line no-await-in-loop
            await grupoFamiliar.addPessoa(ben.pessoa, {
              transaction: t,
              through: {
                contratoid: contrato.numerocontrato,
                tipobeneficiarioid: tipoBeneficiario.id,
                dataregistrosistema: new Date(),
                dataadesao: ben.dataAdesao || dataAdesao,
                ...(vendedor ? { corretoraid: vendedor.corretoraid } : {}),
                ...(vendedor ? { vendedorid: vendedor.vendedorid } : {}),
                valor,
                numerocarteira: GeraCarteira({
                  operadora: operadoraid,
                  sequencia: sequenciaCorrect,
                  tipoBeneficiario: tipoBeneficiario.id,
                }),
                via: 'A',
                sequencia: sequenciaCorrect,
                ativo: 1,
                responsavelgrupo: pessoaBeneficiarioTitular.pessoa.id,
                descontovalor: ben.valorLiquido ? valor - ben.valorLiquido : 0,
                descontoporcent: ben.valorLiquido ? ((valor - ben.valorLiquido) * 100) / valor : 0,
                motivoadesaoid: ben.motivoAdesao || body.MotivoAdesao || 268,
                planoid: produto.planoid,
                versaoplanoid: produto.versaoid,
                tipocarteiraid: carteirinha.id,
                ben_in_requerente: false,
                ben_in_cobertura_parcial_tmp: false,
                ben_in_proc_excluidos_cob: false,
                importado: 'N',
                ben_nu_qtd_mes_ativo: 1,
                ben_nu_qtd_ciclo_ativo: 1,
              },
            });
          }

          /**
           * Modalidade de Pagamento
           */
          const modPagamento = await ModalidadePagamento.findOne({
            where: {
              id: body.FormaPagamento.Modalidade,
            },
            transaction: t,
          });

          if (!modPagamento || !body.FormaPagamento.Modalidade) {
            throw new Error('É necessário informar uma modalidade de pagamento em FormaPagamento.Modalidade');
          }

          const verifyCarteira = await TipoCarteira.findOne({
            where: {
              id: body.FormaPagamento.TipoCarteira,
              modalidadepagamentoid: modPagamento.id,
            },
            transaction: t,
          });

          if (!verifyCarteira) throw new Error('A carteira não pertence a modalidade escolhida');

          /**
           * Criando Ciclo Financeiro
           */
          const dataVencimentoTitulo = dataAdesao
            ? moment(dataAdesao)
                .add(infoVigencia.mesesvigencia + 1, 'months')
                .format()
            : moment(moment(body.FormaPagamento.DiaVencimentoMes, 'DD').format())
                .add(infoVigencia.mesesvigencia + 1, 'months')
                .format();

          const titulo = await Titulo.create(
            {
              vinculopessoaid: 4,
              cmfid: 18,
              grupocmfid: 4,
              tipodocumentoid: 1,
              statusid: 1,
              numerocontratoid: contrato.id,
              numerodocumento: contrato.numerocontrato,
              valor: valorContratoLiquido * infoVigencia.mesesvigencia,
              numerototalparcelas: qtdParcelas,
              numerodiavencimento: body.FormaPagamento.DiaVencimentoMes,
              ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
              datavencimento: dataVencimentoTitulo,
              dataperiodoinicial: dataAdesao,
              dataperiodofinal: dataVencimentoTitulo,
              datacadastro: new Date(),
              tipopessoa: 'F',
              pessoaid: responsavelFinanceiro.id,
              pessoausuarioid: 1,
              tipodecarteiraid: verifyCarteira.id,
              obs: 'Título gerado apartir da api giga.',
              ciclocontrato: 1,
            },
            { transaction: t }
          );

          let addMonth = 1;
          let j = 1;
          let mesVigencia = qtdParcelas;

          if (body.Pagamentos && body.DataPagamento) {
            mesVigencia -= 1;

            const dataVencimento = body.DataVencimento || body.DataPagamento;

            await Parcela.create(
              {
                pessoausuarioid: 1,
                tituloid: titulo.id,
                tipodocumentoid: 1,
                numero: j,
                datavencimento: moment(dataVencimento, 'YYYY-MM-DD').format(),
                datacadastramento: new Date(),
                statusgrupoid: 1,
                valor: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
                valor_bruto: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
                pcl_in_cobranca: false,
              },
              { transaction: t }
            );

            j += 1;

            if (
              moment(dataVencimento, 'YYYY-MM-DD').isSame(
                moment(dataVencimento, 'YYYY-MM-DD').set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10))
              ) ||
              moment(dataVencimento, 'YYYY-MM-DD').isAfter(
                moment(dataVencimento, 'YYYY-MM-DD').set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10))
              )
            ) {
              addMonth += 1;
            }
          }

          for (let i = 1; i <= mesVigencia; i += 1) {
            const dataVencimento = dataAdesao || body.DataVencimento || body.DataPagamento || new Date();

            // eslint-disable-next-line no-await-in-loop
            await Parcela.create(
              {
                pessoausuarioid: 1,
                tituloid: titulo.id,
                tipodocumentoid: 1,
                numero: j,
                datavencimento: moment(dataVencimento, 'YYYY-MM-DD')
                  .set('date', parseInt(body.FormaPagamento.DiaVencimentoMes, 10))
                  .add(addMonth - 1, 'months')
                  .format(),
                datacadastramento: new Date(),
                statusgrupoid: 1,
                valor: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
                valor_bruto: (valorContratoLiquido * infoVigencia.mesesvigencia) / qtdParcelas,
                pcl_in_cobranca: false,
              },
              { transaction: t }
            );

            addMonth += 1;

            j += 1;
          }

          const parcelas = await titulo.getParcelas({ transaction: t });

          if (body.Pagamentos) {
            const firstInstallment = parcelas.sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10))[0];
            await BaixarParcelaService.execute({
              transaction: t,
              forma_pagamento: body.Pagamentos,
              id_parcela: firstInstallment.id,
              id_contrato: contrato.id,
              data_pagamento: moment(body.DataPagamento).format() || new Date(),
              connection: sequelize,
            });
          }

          // Verifica metodos de pagamento
          if (modPagamento.id === '3' || modPagamento.id === '10') {
            // Seleciona a regra fechamento
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
                      [Op.eq]: verifyCarteira.id,
                    },
                  },
                ],
              },
              transaction: t,
            });

            // Verifica se existe alguma regra
            if (regraFechamento && !body.Averbacao) {
              const closingDay = body.DataFechamento
                ? setDate(new Date(), body.DataFechamento)
                : setDate(new Date(), regraFechamento.fechamento); // Peda o dia de fechamento

              const dayOfTheWeek = getDay(closingDay); // Pega o dia da semana do fechamento

              const businessDay =
                dayOfTheWeek === 0 || dayOfTheWeek === 6 ? subBusinessDays(closingDay, 1) : closingDay; // Seleciona um dia válido
              const vencimento = setDate(new Date(), regraFechamento.vencimento); // Seleciona o Vencimento do fechamento

              if (isAfter(new Date(), businessDay) && isBefore(new Date(), vencimento)) {
                // gerar boleto para a parcela 2
                const secondInstallment = parcelas[1];

                if (!secondInstallment) {
                  throw new Error('Erro ao gerar parcela');
                }

                const enderecos = await responsavelFinanceiro.getEnderecos({ transaction: t });

                const endereco = enderecos && enderecos.length > 0 ? enderecos[0] : null;

                if (!endereco) {
                  throw new Error('É necessário informar ao menos um endereço para o responsável financeiro');
                }

                const {
                  data: { data: boleto },
                } = await axios.post(
                  `https://www.idental.com.br/api/bb/${operadora}`,
                  {
                    TipoTitulo: 1,
                    ValorBruto: secondInstallment.valor,
                    DataVencimento: format(parseISO(secondInstallment.datavencimento), 'yyyy-MM-dd'),
                    Pagador: {
                      Tipo: 1,
                      Nome: body.ResponsavelFinanceiro.Nome,
                      Documento: body.ResponsavelFinanceiro.CPF,
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
          }

          if (!transaction) await t.commit();

          return contrato;
        }
      }
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }
}
