import { QueryTypes, Op } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import EstadoCivil from '../models/Sequelize/EstadoCivil';

export default class CriaPessoaFisicaService {
  static async execute({
    nome,
    rg,
    cpf,
    datanascimento,
    sexo,
    orgaoemissor,
    nomedamae,
    nacionalidade,
    estadocivil,
    sequelize,
    transaction,
  }) {
    let pessoaid = await sequelize.query("SELECT NEXTVAL('sp_dados_pessoa_seq') AS id", {
      type: QueryTypes.SELECT,
      transaction,
    });

    pessoaid = pessoaid.shift().id;

    const estadoCivil = await EstadoCivil.findOne({
      where: {
        descricao: {
          [Op.iLike]: estadocivil,
        },
      },
    });

    return Pessoa.findOrCreate({
      where: {},
      include: [{ model: PessoaFisica, as: 'dadospessoafisica', where: { cpf } }],

      defaults: {
        id: pessoaid,

        dadospessoafisica: {
          nome,
          rg,
          cpf,
          estadocivilid: estadoCivil.id,
          nacionalidade,
          datanascimento,
          sexo,
          orgaoemissor,
          nomedamae,
        },
        include: [{ model: PessoaFisica, as: 'dadospessoafisica' }],
      },

      transaction,
    });
  }
}
