/* eslint-disable default-case */
import { QueryTypes } from 'sequelize';
import moment from 'moment';

import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import ModalidadePagamento from '../models/Sequelize/ModalidadePagamento';
import Telefone from '../models/Sequelize/Telefone';
import Email from '../models/Sequelize/Email';
import Endereco from '../models/Sequelize/Endereco';
import CentroCusto from '../models/Sequelize/CentroCusto';
import Produto from '../models/Sequelize/Produto';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';

import Parcela from '../models/Sequelize/Parcela';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

import GeraCarteira from '../helpers/GerarCarteira';

import AdicionarVinculoService from './AdicionarVinculoService';

import CriaPessoaFisicaService from './CriaPessoaFisicaService';

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

const mp = {
  1: 'CHEQUE',
  2: 'CARTÃO DE CRÉDITO',
  3: 'DÉBITO EM CONTA',
  4: 'ESPÉCIE',
  5: 'BOLETO BANCÁRIO',
  6: 'CONSIGNATARIA',
  7: 'PAGAMENTO ELETRÔNICO',
  8: 'COMISSÃO',
  9: 'CARTAO DE CREDITO AVULSO',
  10: 'DEPOSITO',
};

export default class CriaContratoService {
  static async execute({ formValidation: body, sequelize }) {
    const t = await sequelize.transaction();
    try {
      switch (body.Convenio) {
        case 'Empresa':
          // eslint-disable-next-line no-undef
          CriarContratoEmpresa(body);
          return true;
        default: {
          const produto = await Produto.findOne({
            where: {
              id: body.Produto,
              pro_id_tipo_contrato: body.TipoContrato,
            },
          });

          if (!produto)
            throw new Error('Produto selecionado não encontrado ou está indisponível para o tipo contrato selecionado');

          const centroCusto = body.CentroCusto ? await CentroCusto.findByPk(body.CentroCusto) : null;

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
                    AND (sp_dadospessoafisica.id = :vendedorid)
            ORDER  BY sp_dadospessoafisica.nome
            `,
              {
                type: QueryTypes.SELECT,
                replacements: { vendedorid: body.Vendedor },
              }
            );

            if (!row) throw new Error('Vendedor não encontrado em nosso banco de dados');

            vendedor = row;
          }
          /**
           * Cria o responsavel financeiro
           */
          const [responsavelFinanceiro] = await CriaPessoaFisicaService.execute({
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

          await AdicionarVinculoService.execute({
            pessoa: responsavelFinanceiro,
            vinculo: bv.PESSOA_FISICA,
            atributos: body.ResponsavelFinanceiro,
            sequelize,
            transaction: t,
          });

          await AdicionarVinculoService.execute({
            pessoa: responsavelFinanceiro,
            vinculo: bv.REPONSAVEL_FINANCEIRO,
            atributos: body.ResponsavelFinanceiro,
            sequelize,
            transaction: t,
          });

          if (body.Convenio === 'Municipio') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_MUNICIPAL,
              atributos: body.ResponsavelFinanceiro,
              sequelize,
              transaction: t,
            });
          }

          if (body.Convenio === 'Estado') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_ESTADUAL,
              atributos: body.ResponsavelFinanceiro,
              sequelize,
              transaction: t,
            });
          }

          if (body.Convenio === 'Federal') {
            await AdicionarVinculoService.execute({
              pessoa: responsavelFinanceiro,
              vinculo: bv.SERVIDOR_PUBLICO_FEDERAL,
              atributos: body.ResponsavelFinanceiro,
              sequelize,
              transaction: t,
            });
          }

          if (body.ResponsavelFinanceiro.Enderecos) {
            const enderecos = body.ResponsavelFinanceiro.map(
              (endereco) =>
                new Endereco({
                  logradouro: endereco.Logradouro,
                  bairro: endereco.Bairro,
                  cidade: endereco.Cidade,
                  estado: endereco.Estado,
                  complemento: endereco.Complemento,
                  numero: endereco.Numero,
                  cep: endereco.Cep,
                  tipoenderecoid: endereco.TipoEndereco || 1,
                  end_in_principal: endereco.Principal,
                  vinculoid: bv.REPONSAVEL_FINANCEIRO,
                })
            );

            // eslint-disable-next-line no-await-in-loop
            await responsavelFinanceiro.addEnderecos(enderecos, { transaction: t });
          }

          if (body.ResponsavelFinanceiro.Telefones) {
            const telefones = body.ResponsavelFinanceiro.Telefones.map(
              (tel) =>
                new Telefone({
                  numero: tel.Numero,
                  ramal: tel.Ramal,
                  tel_in_principal: tel.Principal,
                  vinculoid: bv.REPONSAVEL_FINANCEIRO,
                  tipotelefoneid: tel.TipoTelefone || 3,
                })
            );

            // eslint-disable-next-line no-await-in-loop
            await responsavelFinanceiro.addTelefones(telefones, { transaction: t });
          }

          if (body.ResponsavelFinanceiro.Emails) {
            const emails = body.ResponsavelFinanceiro.Emails.map(
              (email) =>
                new Email({
                  descricao: email.Email,
                  ema_in_principal: email.Principal,
                  tipoemailid: email.TipoEmail || 3,
                  vinculoid: bv.REPONSAVEL_FINANCEIRO,
                })
            );

            responsavelFinanceiro.addEmails(emails, { transaction: t });
          }

          /**
           * Seleciona id do contrato através do Nextval
           */
          let contratoid = await sequelize.query("SELECT NEXTVAL('cn_contrato_id_seq') as id", {
            type: QueryTypes.SELECT,
            transaction: t,
          });

          contratoid = contratoid.shift().id;

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
              statusid: 6,
              dataadesao: body.DataAdesao,
              datainicialvigencia: body.DataAdesao,
              datafinalvigencia: moment(body.DataAdesao).add(infoVigencia.mesesvigencia, 'months').format(),
              dataregistrosistema: moment().format(),
              ciclovigenciacontrato: 1,
              quantidadedemesesvigencia: infoVigencia.mesesvigencia,
              con_id_regra_vigencia: infoVigencia.id,
              con_nu_prazo_cancela_inad: infoVigencia.rvc_nu_prazo_cancela_inad,
              prazolimitebloqueio: infoVigencia.prazobloqueio,
              obs: body.Observacao,
              tipocontratoid: 5,
              ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
              tipodecarteiraid: body.TipoCarteira,
              motivoadesaoid: body.MotivoAdesao,
              con_in_renovacao_auto: body.RenovacaoAutomatica,
              importado: 'N',
              localid: 1,
              bloqueadopesquisa: false,
            },
            { transaction: t }
          );

          const beneficiarios = [];

          const beneficiarioTitular = body.Beneficiarios.find((ben) => ben.Titular);

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
                  P_ID_TIPOBENEFICIARIO: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
                  P_ID_PLANO: produto.planoid,
                  P_ID_VERSAO: produto.versaoid,
                  P_DT_ADESAO_BENEF: body.DataAdesao,
                },
              }
            );

            console.log(valor);

            // eslint-disable-next-line no-await-in-loop
            const [pessoa] = await CriaPessoaFisicaService.execute({
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

            // eslint-disable-next-line no-await-in-loop
            await AdicionarVinculoService.execute({
              atributos: {
                ...beneficiario,
                ...(!beneficiarioTitular.RG ? {} : { RgDoBeneficiarioTitular: beneficiarioTitular.RG }),
              },
              pessoa,
              sequelize,
              transaction: t,
              vinculo: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
            });

            if (beneficiario.Enderecos) {
              const enderecos = beneficiario.Enderecos.map(
                (endereco) =>
                  new Endereco({
                    logradouro: endereco.Logradouro,
                    bairro: endereco.Bairro,
                    cidade: endereco.Cidade,
                    estado: endereco.Estado,
                    complemento: endereco.Complemento,
                    numero: endereco.Numero,
                    cep: endereco.Cep,
                    tipoenderecoid: endereco.TipoEndereco || 1,
                    end_in_principal: endereco.Principal,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
                  })
              );

              // eslint-disable-next-line no-await-in-loop
              await pessoa.addEnderecos(enderecos, { transaction: t });
            }

            if (beneficiario.Telefones) {
              const telefones = beneficiario.Telefones.map(
                (tel) =>
                  new Telefone({
                    numero: tel.Numero,
                    ramal: tel.Ramal,
                    tel_in_principal: tel.Principal,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
                    tipotelefoneid: tel.TipoTelefone || 3,
                  })
              );

              // eslint-disable-next-line no-await-in-loop
              await pessoa.addTelefones(telefones, { transaction: t });
            }

            if (beneficiario.Emails) {
              const emails = beneficiario.Emails.map(
                (email) =>
                  new Email({
                    descricao: email.Email,
                    ema_in_principal: email.Principal,
                    tipoemailid: email.TipoEmail || 3,
                    vinculoid: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
                  })
              );

              // eslint-disable-next-line no-await-in-loop
              await pessoa.addEmails(emails, { transaction: t });
            }

            beneficiarios.push({
              pessoa,
              vinculo: beneficiario.Titular ? bv.TITULAR : bv[beneficiario.Vinculo],
              valor: valor ? valor.valor : null,
              valorLiquido: beneficiario.Valor,
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
                P_DT_ADESAO_BENEF: body.DataAdesao,
              },
            }
          );

          const valorContratobruto = beneficiarios.reduce((ant, pos) => {
            console.log('ant: ', ant);
            console.log('pos: ', pos.valor || defaultValor);
            return ant + (pos.valor || defaultValor);
          }, 0);

          const valorContratoLiquido = beneficiarios.reduce(
            (ant, pos) => ant + (pos.valorLiquido || pos.valor || defaultValor),
            0
          );

          await contrato.setResponsavelpf(responsavelFinanceiro, {
            through: {
              planoid: produto.planoid,
              versaoplanoid: produto.versaoid,
              diavencimento: body.FormaPagamento.DiaVencimentoMes,
              tipodecarteiraid: body.TipoCarteira,
              qtdparcela: infoVigencia.mesesvigencia,
              valorcontrato: valorContratobruto * infoVigencia.mesesvigencia,
              valormes: valorContratoLiquido,
              valorliquido: valorContratoLiquido * infoVigencia.mesesvigencia,
              valordesconto: valorContratobruto - valorContratoLiquido * infoVigencia.mesesvigencia,
            },
            transaction: t,
          });

          const grupoFamiliar = await contrato.createGrupofamiliar(
            { responsavelgrupoid: responsavelFinanceiro.id },
            { transaction: t }
          );

          const pessoaBeneficiarioTitular = beneficiarios.find((b) => b.vinculo === bv.TITULAR);

          // eslint-disable-next-line no-restricted-syntax
          for (const ben of beneficiarios) {
            // eslint-disable-next-line no-await-in-loop
            const tipoBeneficiario = await TipoBeneficiario.findOne({ where: { codigo: ben.vinculo } });

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
              { replacements: { plano: produto.planoid, tipo: tipoBeneficiario.id }, type: QueryTypes.SELECT }
            );

            const valor = ben.valor || defaultValor;
            // eslint-disable-next-line no-await-in-loop
            await grupoFamiliar.addPessoa(ben.pessoa, {
              transaction: t,
              through: {
                contratoid: contrato.numerocontrato,
                tipobeneficiarioid: tipoBeneficiario.id,
                dataregistrosistema: new Date(),
                dataadesao: body.DataAdesao,
                ...(vendedor ? { corretoraid: vendedor.corretoraid } : {}),
                ...(vendedor ? { vendedorid: vendedor.vendedorid } : {}),
                valor,
                numerocarteira: GeraCarteira({
                  operadora: operadoraid,
                  sequencia,
                  tipoBeneficiario: tipoBeneficiario.id,
                }),
                via: 'A',
                sequencia,
                ativo: 1,
                responsavelgrupo: pessoaBeneficiarioTitular.pessoa.id,
                descontovalor: ben.valorLiquido ? valor - ben.valorLiquido : 0,
                descontoporcent: ben.valorLiquido ? ((valor - ben.valorLiquido) * 100) / valor : 0,
                motivoadesaoid: body.MotivoAdesao || 268,
                planoid: produto.planoid,
                versaoplanoid: produto.versaoid,
                tipocarteiraid: body.FormaPagamento.TipoCarteira,
                ben_in_requerente: false,
                ben_in_cobertura_parcial_tmp: false,
                ben_in_proc_excluidos_cob: false,
                importado: 'N',
                ben_nu_qtd_mes_ativo: 1,
                ben_nu_qtd_ciclo_ativo: 1,
              },
            });
          }

          // await grupoFamiliar.addPessoas(beneficiarios, {
          //   transaction: t,
          // });

          /**
           * Modalidade de Pagamento
           */
          const modPagamento = await ModalidadePagamento.findOne({
            where: { descricao: mp[body.FormaPagamento.Modalidade] },
          });

          if (!modPagamento || !body.FormaPagamento.Modalidade) {
            throw new Error('É necessário informar uma modalidade de pagamento em FomraPagamento.Modalidade');
          }

          const verifyCarteira = await TipoCarteira.findOne({
            where: {
              id: body.FormaPagamento.TipoCarteira,
              modalidadepagamentoid: modPagamento.id,
            },
          });

          if (!verifyCarteira) throw new Error('A carteira não pertence a modalidade escolhida');

          /**
           * Criando Ciclo Financeiro
           */
          const titulo = await Titulo.create(
            {
              vinculopessoaid: 4,
              cmfid: 18,
              tipodocumentoid: 1,
              statusid: 1,
              numerocontratoid: contrato.id,
              numerodocumento: contrato.numerocontrato,
              valor: valorContratoLiquido * infoVigencia.mesesvigencia,
              numerototalparcelas: infoVigencia.mesesvigencia,
              numerodiavencimento: body.FormaPagamento.DiaVencimentoMes,
              ...(centroCusto ? { centrocustoid: centroCusto.id } : {}),
              datavencimento: moment(body.DataAdesao)
                .add(infoVigencia.mesesvigencia + 1, 'months')
                .format(),
              dataperiodoinicial: body.DataAdesao,
              dataperiodofinal: moment(body.DataAdesao).add(infoVigencia.mesesvigencia, 'months').format(),
              datacadastro: new Date(),
              tipopessoa: 'F',
              pessoaid: responsavelFinanceiro.id,
              pessoausuarioid: 1,
              tipodecarteiraid: body.TipoCarteira,
              obs: 'Título gerado apartir da api giga.',
              grupocmfid: 4,
              ciclocontrato: 1,
            },
            { transaction: t }
          );

          for (let i = 1; i <= infoVigencia.mesesvigencia; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await Parcela.create(
              {
                pessoausuarioid: 1,
                tituloid: titulo.id,
                tipodocumentoid: 1,
                numerodocumento: i.toString().padStart(2, '0'),
                numero: i,
                datavencimento: moment(body.DataAdesao)
                  .add(i - 1, 'months')
                  .format(),
                datacadastramento: new Date(),
                statusgrupoid: 1,
                valor: valorContratoLiquido,
                valor_bruto: valorContratoLiquido,
                pcl_in_cobranca: false,
              },
              { transaction: t }
            );
          }

          await t.commit();

          return contrato;
        }
      }
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
