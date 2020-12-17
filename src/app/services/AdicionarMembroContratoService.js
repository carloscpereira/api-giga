import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import Beneficiario from '../models/Sequelize/Beneficiario';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import AssociadoPF from '../models/Sequelize/AssociadoPF';
import AssociadoPJ from '../models/Sequelize/AssociadoPJ';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import RegraFechamento from '../models/Sequelize/RegraFechamento';
import TipoBeneficiario from '../models/Sequelize/TipoBeneficiario';
import Produto from '../models/Sequelize/Produto';

import GeraCarteira from '../helpers/GerarCarteira';

import CriaPessoaFisicaService from './CriaPessoaFisicaService';
import AdicionarVinculoService from './AdicionarVinculoService';
import AdicionarEmailService from './AdicionarEmailService';
import AdicionarTelefoneService from './AdicionarTelefoneService';
import AdicionarEnderecoService from './AdicionarEnderecoService';

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

export default class AdicionarMembroContratoService {
  static async execute({
    beneficiario,
    id_grupofamiliar,
    id_contrato,
    id_vendedor,
    id_corretor,
    vinculo,
    // formaPagamento,
    sequelize,
    transaction,
  }) {
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
      const contrato = await Contrato.findOne({
        where: {
          id: id_contrato,
          statusid: {
            [Op.in]: [8, 6],
          },
          tipocontratoid: {
            [Op.in]: [5, 9],
          },
        },
        include: [
          { model: PessoaFisica, as: 'responsavel_pessoafisica' },
          { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
          {
            model: GrupoFamiliar,
            as: 'gruposfamiliar',
            include: [{ model: PessoaFisica, as: 'beneficiarios' }],
          },
        ],
      });

      // Testa se Contrato existe ou se ele está disponível para realizar a operação (Está ativo ou pré-cadastro, por exemplo)
      if (!contrato) throw new Error('Contrato não encontrato ou indisponível para realizar a operação');

      // const contratoIsValide = contrato.tipocontratoid === 5 || contrato.tipocontratoid === 8;
      const contratoIsPJ = contrato.tipocontratoid === 9;

      // Testa validade do contrato
      // if (!contratoIsValide) {
      //   throw new Error('É necessário que seja um contrato de associado para que seja adicionado um membro');
      // }

      // Pega os dados do Responsável Financeiro do Contrato
      const rfContrato = contratoIsPJ ? contrato.responsavel_pessoajuridica : contrato.responsavel_pessoafisica;

      // Seleciona o título em vigencia do contrato
      const tituloContratoVigente = await Titulo.findOne({
        where: {
          numerocontratoid: contrato.id,
          statusid: 1, // Seleciona Título ativo
          dataperiodoinicial: {
            [Op.lte]: new Date(),
          }, // Pega Titulo onde o periodo inicial é menor ou igual a data atual
          dataperiodofinal: {
            [Op.gte]: new Date(),
          }, // Pega Titulo onde o periodo final é maior ou igual a data atual
        },
        order: [['id', 'DESC']],
      });

      // Caso não haja nenhum título ativo, emite erro, pois, o ainda não foi renovado.
      if (!tituloContratoVigente) throw new Error('Contrato quitado ou não renovado');

      // Todas parcelas do título em vigencia
      const parcelasTitulo = await tituloContratoVigente.getParcelas();

      // Última parcela paga do título em vigência
      // const ultimaParcelaPaga = _.orderBy(
      //   parcelasTitulo.filter((p) => p.statusgrupoid === 2),
      //   (i) => i.id,
      //   ['desc']
      // ).shift();

      // Regra do Giga para próxima parcela válida
      const proximaParcelaValida = await sequelize.query(
        `
        SELECT parcela.* FROM parcela
          INNER JOIN titulo ON parcela.tituloid = titulo.id
          LEFT JOIN cn_fatura_empresa ON parcela.id = cn_fatura_empresa.parcelaid
          LEFT JOIN parcelalote ON parcela.id = parcelalote.parcelaid
          LEFT JOIN parcela_acrescimo_desconto ON parcela.id = parcela_acrescimo_desconto.parcelaid
          WHERE  (parcela.datavencimento >= Current_Date + CASE
            WHEN (SELECT MAX(v.periodovencimento) FROM cn_versaoplano v
            WHERE v.id IN (SELECT b.versaoplanoid FROM cn_beneficiario b
              WHERE (b.ativo = '1') AND (b.contratoid = :P_ID_CONTRATO))) IS NULL THEN 0
            ELSE (SELECT MAX(v.periodovencimento) FROM cn_versaoplano v
            WHERE v.id IN (SELECT b.versaoplanoid FROM cn_beneficiario b
              WHERE (b.ativo = '1') AND (b.contratoid = :P_ID_CONTRATO))) END) AND
          (parcela.statusgrupoid = 1) AND
          (parcela.codigobarras IS NULL) AND
          (parcela.statusarquivo IS NULL) AND
          (cn_fatura_empresa.parcelaid IS NULL) AND
          (parcelalote.parcelaid IS NULL) AND
          (titulo.id = :P_ID_TITULO) AND
          (parcela_acrescimo_desconto.parcelaid IS NULL) LIMIT 1
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { P_ID_CONTRATO: contrato.id, P_ID_TITULO: tituloContratoVigente.id },
          plain: true,
          model: Parcela,
        }
      );

      // Pega os dados financeiros do contrato
      const infoContrato = contratoIsPJ
        ? await AssociadoPJ.findByPk(rfContrato.shift().AssociadoPJ.id)
        : await AssociadoPF.findByPk(rfContrato.shift().AssociadoPF.id);
      const beneficiariosContrato = _.flattenDeep(contrato.gruposfamiliar.map(({ beneficiarios }) => beneficiarios)); // Armazena beneficiarios do contrato atual

      const checaBeneficiario = beneficiariosContrato.filter(
        (ben) => ben.cpf === beneficiario.CPF && ben.Beneficiario.ativo === '1'
      );

      if (checaBeneficiario && checaBeneficiario.length > 0) {
        throw new Error('O beneficiario já se encontra cadastrado no contrato');
      }

      // Seleciona Regra de Fechamento
      const regraFechamento = await RegraFechamento.findOne({
        [Op.or]: [
          {
            tiposcontrato_id: contrato.tipocontratoid,
            tipodecarteira_id: contrato.tipocarteiraid,
            centrocusto_id: contrato.centrocustoid,
            vencimento: infoContrato.diavencimento,
          },
        ],
      });

      if (
        !proximaParcelaValida ||
        moment(proximaParcelaValida.datavencimento).diff(moment(), 'days') <= regraFechamento.fechamento
      ) {
        throw new Error('Parcela fechada, não é possível adicionar beneficiarios nesse contrato esse mês');
      }

      if (!proximaParcelaValida || moment(proximaParcelaValida.datavencimento).diff(moment(), 'days') > 1) {
        throw new Error('Parcela fechada, não é possível adicionar beneficiarios nesse contrato esse mês');
      }

      let grupoFamiliar = null; // Grupo Familiar, se selecionado
      let responsavelGrupoFamiliar = null; // Responsável do Grupo Familiar (titular)
      let produto = null; // Produto || Plano & Versão Plano
      let vendedor = null; // Armazena o vendedor e a corretora

      // Testo para ver se o beneficiario será o titular do grupo familiar
      const beneficiarioIsTitular = contratoIsPJ && !grupoFamiliar && beneficiario.Produto;

      // Seleciona o grupo familiar
      if (contratoIsPJ && id_grupofamiliar) {
        grupoFamiliar = await GrupoFamiliar.findOne({
          where: {
            grupo: id_grupofamiliar,
            contratoid: id_contrato,
          },
          include: [
            {
              model: PessoaFisica,
              through: Beneficiario,
              as: 'beneficiarios',
            },
          ],
        });
      } else if (!contratoIsPJ) {
        const gruposContrato = await contrato.getGruposfamiliar(); // Pego todos os grupos familiares do contrato
        const grupoFamiliarID = gruposContrato.shift().grupo; // O id (grupo) do primeiro grupo familiar

        // Seleciono e populo a variavel grupoFamiliar com o grupo selecionado
        grupoFamiliar = await GrupoFamiliar.findOne({
          where: { grupo: grupoFamiliarID, contratoid: id_contrato },
          include: [
            {
              model: PessoaFisica,
              through: Beneficiario,
              as: 'beneficiarios',
            },
          ],
        });
      }

      // Seleciona o responsável do grupo para inserção do novo beneficiário
      if (grupoFamiliar) {
        responsavelGrupoFamiliar = grupoFamiliar.beneficiarios.find(
          ({ id }) => id === grupoFamiliar.responsavelgrupoid.toString()
        );
      }

      if ((id_vendedor && id_corretor) || responsavelGrupoFamiliar) {
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
            replacements: {
              vendedorid: id_vendedor || responsavelGrupoFamiliar.Beneficiario.vendedorid,
              corretoraid: id_corretor || responsavelGrupoFamiliar.Beneficiario.corretoraid,
            },
          }
        );

        vendedor = row;
      }

      // Verifica se o vendedor é válido
      if (!vendedor) {
        throw new Error('Informa um vendedor e uma corretora válido');
      }

      if (contratoIsPJ && !grupoFamiliar && !beneficiario.Produto)
        throw new Error('É necessário informar um produto para adicionar esse beneficiário');

      // Crio nova Pessoa // Beneficiario
      const [novoBeneficiario] = await CriaPessoaFisicaService.execute({
        nome: beneficiario.Nome,
        cpf: beneficiario.CPF,
        datanascimento: moment(beneficiario.DataNascimento).format(),
        estadocivil: beneficiario.EstadoCivil,
        nacionalidade: beneficiario.Nacionalidade,
        nomedamae: beneficiario.NomeDaMae,
        orgaoemissor: beneficiario.OrgaoEmissor,
        rg: beneficiario.RG,
        sexo: beneficiario.Sexo,
        transaction: t,
        sequelize,
      });

      // Adiciono os endereços do beneficiario caso tenha enviado
      if (beneficiario.Enderecos) {
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
              vinculoid: beneficiarioIsTitular ? bv.TITULAR : bv[vinculo],
              pessoa: novoBeneficiario,
              sequelize,
              transaction: t,
            })
          )
        );
      }

      // Adiciono os telefones do beneficiario caso tenha enviado
      if (beneficiario.Telefones) {
        await Promise.all(
          beneficiario.Telefones.map((tel) =>
            AdicionarTelefoneService.execute({
              numero: tel.Numero,
              ramal: tel.Ramal,
              tel_in_principal: tel.Principal,
              vinculoid: beneficiarioIsTitular ? bv.TITULAR : bv[vinculo],
              tipotelefoneid: tel.TipoTelefone || 3,
              pessoa: novoBeneficiario,
              sequelize,
              transaction: t,
            })
          )
        );
      }

      // Adiciono os emails do beneficiario caso tenha enviado
      if (beneficiario.Emails) {
        await Promise.all(
          beneficiario.Emails.map((email) =>
            AdicionarEmailService.execute({
              ema_in_principal: email.Principal,
              vinculoid: beneficiarioIsTitular ? bv.TITULAR : bv[vinculo],
              email: email.Email,
              pessoa: novoBeneficiario,
              sequelize,
              tipoemail: email.TipoEmail || 3,
              transaction: t,
            })
          )
        );
      }

      //  Adiciono o vínculo a beneficiário
      await AdicionarVinculoService.execute({
        atributos: {
          ...beneficiario,
        },
        pessoa: novoBeneficiario,
        sequelize,
        transaction: t,
        vinculo: bv.PESSOA_FISICA,
      });

      if (beneficiarioIsTitular) {
        await AdicionarVinculoService.execute({
          atributos: {
            ...beneficiario,
          },
          pessoa: novoBeneficiario,
          sequelize,
          transaction: t,
          vinculo: bv.TITULAR,
        });
      } else {
        await AdicionarVinculoService.execute({
          atributos: {
            ...beneficiario,
            RgDoBeneficiarioTitular: responsavelGrupoFamiliar.rg,
          },
          pessoa: novoBeneficiario,
          sequelize,
          transaction: t,
          vinculo: bv[vinculo],
        });
      }

      // Seleciona o Produto || Plano do Beneficiário
      if (grupoFamiliar && responsavelGrupoFamiliar) {
        produto = await Produto.findOne({
          where: {
            planoid: responsavelGrupoFamiliar.Beneficiario.planoid,
            versaoid: responsavelGrupoFamiliar.Beneficiario.versaoplanoid,
          },
        });
      } else if (beneficiarioIsTitular) {
        produto = await Produto.findByPk(beneficiario.Produto);
      } else {
        throw new Error('Lancei a braba');
      }

      // Crio grupo novo no caso de contrato pessoa jurídica
      if (!grupoFamiliar && beneficiarioIsTitular) {
        grupoFamiliar = await contrato.createGrupofamiliar(
          { responsavelgrupoid: novoBeneficiario.id },
          { transaction: t }
        );
      }

      // Seleciona o ID da operadora
      const [{ operadoraid }] = await sequelize.query(
        'SELECT pessoaoperadoraid as operadoraid FROM configuracao_sistema',
        {
          type: QueryTypes.SELECT,
        }
      );

      // Seleciona a Carteirinha
      const carteirinha = await sequelize.query('SELECT * FROM cn_tipocarteira LIMIT 1', {
        type: QueryTypes.SELECT,
        plain: true,
      });

      // Seleciona o Tipo de Beneficiário
      const tipoBeneficiario = beneficiarioIsTitular
        ? await TipoBeneficiario.findOne({ where: { codigo: bv.TITULAR } })
        : await TipoBeneficiario.findOne({ where: { codigo: bv[vinculo] } });

      // Seleciona Valor do Plano
      const [{ valor: valorPlano }] = await sequelize.query(
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
            P_ID_PLANO: produto.planoid,
            P_ID_VERSAO: produto.versaoid,
            P_DT_ADESAO_BENEF: beneficiario.DataAdesao,
          },
        }
      );

      // Seleciona a sequencia que fará parte da carteirinha
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

      // Adiciona a pessoa ao grupo familiar
      await grupoFamiliar.addPessoa(novoBeneficiario, {
        transaction: t,
        through: {
          contratoid: contrato.id,
          tipobeneficiarioid: tipoBeneficiario.id,
          dataregistrosistema: new Date(),
          dataadesao: beneficiario.DataAdesao || new Date(),
          valor: valorPlano,
          numerocarteira: GeraCarteira({
            operadora: operadoraid,
            sequencia,
            tipoBeneficiario: tipoBeneficiario.id,
          }),
          via: 'A',
          sequencia,
          ativo: 1,
          vendedorid: vendedor.vendedorid,
          corretoraid: vendedor.corretoraid,
          responsavelgrupo: responsavelGrupoFamiliar.id,
          descontovalor: beneficiario.Valor ? valorPlano - beneficiario.Valor : 0,
          descontoporcent: beneficiario.Valor ? (beneficiario.Valor * 100) / valorPlano : 0,
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

      /**
       * Sessão Financeira
       */

      const somaBeneficiariosContrato = beneficiariosContrato
        .filter((ben) => ben.Beneficiario.ativo === '1')
        .reduce(
          (ant, prox) => ant + (parseFloat(prox.Beneficiario.valor) - parseFloat(prox.Beneficiario.descontovalor)),
          0
        );
      const parcelasPagasTitulo = parcelasTitulo.filter(
        (p) => parseInt(p.statusgrupoid, 10) === 2 || moment(p.datavencimento).isBefore(moment())
      ); // pegando todas parcelas pagas do título
      const somaTotalPago = parcelasPagasTitulo.reduce((ant, prox) => ant + parseFloat(prox.valor), 0); // somando o valor de todas parcelas pagas
      const novoValorParcela = parseFloat(somaBeneficiariosContrato) + (parseFloat(beneficiario.Valor) || valorPlano); // calculo para definir novo valor da parcela por mês

      // calculo para definir novo valor do título
      const novoValorTitulo =
        somaTotalPago + novoValorParcela * (tituloContratoVigente.numerototalparcelas - parcelasPagasTitulo.length);

      // atualizando titulo com novo valor em vigencia
      await tituloContratoVigente.update({ valor: novoValorTitulo }, { transaction: t });

      // atualizando parcelas para novo valor em vigencia
      await Parcela.update(
        { valor: novoValorParcela, valor_bruto: novoValorParcela },
        {
          where: { tituloid: tituloContratoVigente.id, statusgrupoid: 1, datavencimento: { [Op.gte]: new Date() } },
          transaction: t,
        }
      );

      // atualizando novo valor de contrato para valor real
      await infoContrato.update(
        { valorcontrato: novoValorTitulo, valormes: novoValorParcela, valorliquido: novoValorParcela },
        { transaction: t }
      );

      if (!transaction) t.commit();

      return contrato;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }
}
