import { QueryTypes } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import PessoaFisica from '../models/Sequelize/PessoaFisica';

export default class CriaPessoaFisicaService {
  static async execute({
    razaosocial,
    nomefantasia,
    cnpj,
    inscricaoestadual,
    inscricaomunicipal,
    codigo,
    sequelize,
    transaction,
  }) {
    let pessoaid = await sequelize.query("SELECT NEXTVAL('sp_dados_pessoa_seq') AS id", {
      type: QueryTypes.SELECT,
      transaction,
    });

    pessoaid = pessoaid.shift().id;

    return Pessoa.findOrCreate({
      where: {},
      include: [{ model: PessoaFisica, as: 'dadospessoafisica', where: { cnpj } }],

      defaults: {
        id: pessoaid,

        dadospessoafisica: {
          razaosocial,
          nomefantasia,
          cnpj,
          inscricaoestadual,
          inscricaomunicipal,
          codigo,
        },
        include: [{ model: PessoaFisica, as: 'dadospessoajuridica' }],
      },

      transaction,
    });
  }
}
