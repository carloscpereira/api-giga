import moment from 'moment';

import Contrato from '../models/Sequelize/Contrato';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import LotePagamento from '../models/Sequelize/LotePagamento';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';

// Services
import CancelarContratoService from './CancelarContratoService';
import CriaContratoService from './CriaContratoService';
import RemoverMembroContrato from './RemoveMembroContratoService';

export default class MigrarContratoService {
  static async execute({
    id_contrato,
    request: { Beneficiarios: beneficiarios, Produto: produto, ...request },
    sequelize,
  }) {
    const t = await sequelize.transaction();
    console.log(request);
    try {
      const contrato = await Contrato.findByPk(id_contrato, {
        where: {
          statusid: '8',
        },

        include: [
          { model: PessoaFisica, as: 'responsavel_pessoafisica', required: true },
          {
            model: GrupoFamiliar,
            as: 'gruposfamiliar',
            required: true,
            include: [{ model: PessoaFisica, as: 'beneficiarios', through: { where: { ativo: '1' } } }],
          },
          {
            model: Titulo,
            as: 'titulos',
            where: {
              statusid: 1,
            },
            limit: 1,
            order: [['id', 'desc']],
            required: true,
            include: [
              {
                model: Parcela,
                as: 'parcelas',
                order: [['id', 'desc']],
                limit: 1,
                where: {
                  statusgrupoid: 2,
                },
                include: [
                  {
                    model: LotePagamento,
                    as: 'lotes',
                    required: false,
                    through: {
                      attributes: ['pal_dt_pagamento'],
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!contrato || contrato.statusid !== '8') throw new Error('Contrato não encontrado');

      const ultimaParcela = contrato.titulos[0].parcelas[0];
      const pagamentoUltimaParcela = ultimaParcela ? ultimaParcela.lotes[0].ParcelaLote.pal_dt_pagamento : null;
      const dtDiffParcela = moment().diff(moment(pagamentoUltimaParcela, 'Y-M-D'), 'days');
      const oldInfoContrato = contrato.responsavel_pessoafisica[0].AssociadoPF;
      const beneficiariosContrato = contrato.gruposfamiliar[0].beneficiarios;

      // await CancelarContratoService.execute({ id: contrato.id, transaction: t });

      const mBeneficiarios = beneficiarios
        ? await Promise.all(
            beneficiarios.map(async (ben) => {
              return PessoaFisica.findOne({
                where: { cpf: ben.CPF },
                include: [
                  {
                    model: GrupoFamiliar,
                    as: 'gruposfamiliar',
                    through: { where: { contratoid: contrato.id } },
                  },
                ],
              });
            })
          )
        : [null];

      const checkBeneficiarioContrato = mBeneficiarios.reduce((ant, dep) => ant && !!dep, true);
      console.log(mBeneficiarios[0].gruposfamiliar[0].Beneficiario);
      /**
       * Testo se os beneficiários enviados pertence ao contrato
       */
      if (!checkBeneficiarioContrato) throw new Error('Beneficiário não pertence ao grupo');

      const newCustContract = beneficiarios.reduce((ant, { Valor: pos }) => ant + pos, 0) / beneficiarios.length;
      const oldCustCOntract = oldInfoContrato.valormes;

      const diffCust = oldCustCOntract - newCustContract;

      await RemoverMembroContrato.execute({
        id_contrato: contrato.id,
        id_pessoa: mBeneficiarios[0].id,
        transaction: t,
      });
      /**
       * Testa se o Contrato novo tem a mensalidade mais cara que o contrato atual
       */
      // if (diffCust > 0 || diffCust === 0) {
      //   // Se o novo contrato tiver o mesmo valor ou for mais barato

      //   /**
      //    * Testa se o contrato antigo tem mais de 1 membro
      //    */
      //   if (beneficiariosContrato.length > 1 || beneficiariosContrato.length !== mBeneficiarios.length) {
      //     // Caso o contrato tenha mais de um membro
      //     const checkIsTitular = !!mBeneficiarios.filter(
      //       ({ gruposfamiliar }) =>
      //         !!gruposfamiliar.filter(({ Beneficiario: { tipobeneficiarioid } }) => tipobeneficiarioid === '1')
      //     );

      //     /**
      //      * Verifica se algum dos beneficiarios são titulares
      //      */
      //     if (checkIsTitular) {
      //       // Cria contrato para os membros que não irão migrar
      //       await CriaContratoService.execute({ formValidation: {} });

      //       // Cria um novo contrato para os membros que irão migrar
      //       await CriaContratoService.execute({ formValidation: {} });

      //       // Cancela Contrata antigo
      //       await CancelarContratoService.execute({ id: contrato.id, transaction: t });
      //     } else {
      //     }
      //   } else {
      //     // Caso tenha apenas um membro
      //     await CancelarContratoService.execute({ id: contrato.id, transaction: t });

      //     // Cria um novo contrato
      //   }
      // } else {
      //   // Se o novo contrato for mais caro
      // }

      // console.log(oldInfoContrato);
      t.rollback();
      return contrato;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }
}
