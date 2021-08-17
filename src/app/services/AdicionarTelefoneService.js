import { Sequelize, Transaction } from 'sequelize';
import AppError from '../errors/AppError';
import Telefone from '../models/Sequelize/Telefone';

export default class AdicionarTelefoneService {
  static async execute({
    pessoa,
    numero = '',
    ramal = '',
    tipotelefoneid = '',
    vinculoid,
    tel_in_principal = false,
    sequelize,
    transaction,
  }) {
    let t = transaction;

    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new AppError(
        500,
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instancia da conexão'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }

    const verifyExistsTelefone = await Telefone.findOne({
      where: {
        numero,
        ramal,
        dadosid: pessoa.id,
      },
      transaction: t,
    });

    if (verifyExistsTelefone) {
      await verifyExistsTelefone.destroy({ transaction: t });
    }

    if (tel_in_principal) {
      const verifyTelefonePrincipal = await Telefone.findOne({
        where: {
          tel_in_principal: true,
          dadosid: pessoa.id,
        },
        transaction: t,
      });

      if (verifyTelefonePrincipal)
        await verifyTelefonePrincipal.update({ tel_in_principal: false }, { transaction: t });
    }

    const newTelefone = await Telefone.create(
      {
        tipotelefoneid,
        dadosid: pessoa.id,
        ramal,
        numero,
        vinculoid,
        tel_in_principal,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();

    return newTelefone;
  }
}
