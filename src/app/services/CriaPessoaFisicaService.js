import { QueryTypes, Sequelize, Transaction } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import EstadoCivil from '../models/Sequelize/EstadoCivil';

export default class CriaPessoaFisicaService {
  static async execute({
    nome,
    id,
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
    let t = transaction;
    // Testa se a instancia de conexão com o banco de dados foi passada corretamente
    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new Error('Não foi possível estabalecer conexão com o banco de dados');
    }

    // Testa se a instancia de transação foi mandada corretamente, caso não, cria uma nova instancia
    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }

    const personExists = await Pessoa.findOne({
      where: {
        ...(id ? { id } : {}),
      },
      include: [
        {
          model: PessoaFisica,
          as: 'dadospessoafisica',
          where: {
            ...(cpf && !id ? { cpf } : {}),
          },
        },
      ],
      transaction: t,
    });

    const estadoCivil = await EstadoCivil.findByPk(estadocivil, { transaction: t });

    let pessoa;

    if (personExists) {
      personExists.dadospessoafisica.nome = nome || personExists.dadospessoafisica.nome;
      personExists.dadospessoafisica.rg = rg || personExists.dadospessoafisica.rg;
      personExists.dadospessoafisica.cpf = cpf || personExists.dadospessoafisica.cpf;
      personExists.dadospessoafisica.estadocivilid =
        (estadoCivil ? estadoCivil.id : null) || personExists.dadospessoafisica.estadocivilid;
      personExists.dadospessoafisica.nacionalidade = nacionalidade || personExists.dadospessoafisica.nacionalidade;
      personExists.dadospessoafisica.datanascimento = datanascimento || personExists.dadospessoafisica.datanascimento;
      personExists.dadospessoafisica.sexo = sexo || personExists.dadospessoafisica.sexo;
      personExists.dadospessoafisica.orgaoemissor = orgaoemissor || personExists.dadospessoafisica.orgaoemissor;
      personExists.dadospessoafisica.nomedamae = nomedamae || personExists.dadospessoafisica.nomedamae;

      await personExists.save({ transaction: t });

      pessoa = personExists;
    } else {
      let pessoaid = await sequelize.query("SELECT NEXTVAL('sp_dados_pessoa_seq') AS id", {
        type: QueryTypes.SELECT,
        transaction: t,
      });

      pessoaid = pessoaid.shift().id;

      pessoa = await Pessoa.create(
        {
          id: pessoaid,
          dadospessoafisica: {
            nome,
            rg,
            cpf,
            estadocivilid: estadoCivil ? estadoCivil.id : null,
            nacionalidade,
            datanascimento,
            sexo,
            orgaoemissor,
            nomedamae,
          },
        },
        { include: [{ model: PessoaFisica, as: 'dadospessoafisica' }], transaction: t }
      );
    }
    if (!transaction) {
      await t.commit();
    }
    return pessoa;
  }
}
