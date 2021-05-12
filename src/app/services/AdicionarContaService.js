import { Sequelize, Transaction } from 'sequelize';

import Conta from '../models/Sequelize/Conta';

export default class AdicionarContaService {
  static async execute({
    pessoa,
    sequelize,
    transaction,
    numero = '',
    tipocontaid = '',
    obs = '',
    agenciaid = '',
    digito = '',
    identificacao = null,
    operacao = '',
    razao = '',
    con_in_principal = false,
  }) {
    let t = transaction;

    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new Error(
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instancia da conexão'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }

    const verifyExistsConta = await Conta.findOne(
      {
        where: {
          numero,
          agenciaid,
          tipocontaid,
          digito,
          operacao,
          pessoaid: pessoa.id,
        },
      },
      { transaction: t }
    );

    if (verifyExistsConta) {
      await verifyExistsConta.destroy({ transaction: t });
    }

    if (con_in_principal) {
      const verifyContaPrincipal = await Conta.findOne(
        {
          where: {
            con_in_principal: true,
            pessoaid: pessoa.id,
          },
        },
        { transaction: t }
      );

      if (verifyContaPrincipal) await verifyContaPrincipal.update({ con_in_principal: false }, { transaction: t });
    }

    const newConta = await Conta.create(
      {
        numero,
        tipocontaid,
        obs,
        agenciaid,
        pessoaid: pessoa.id,
        digito,
        operacao,
        razao,
        identificacao,
        con_in_principal,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();

    return newConta;
  }
}
