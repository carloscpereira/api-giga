import { Op, Sequelize, Transaction } from 'sequelize';
import AppError from '../errors/AppError';

import Email from '../models/Sequelize/Email';

export default class AdicionarEmailService {
  static async execute({ pessoa, email = '', ema_in_principal, vinculoid, tipoemail, sequelize, transaction }) {
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

    const verifyExistsEmail = await Email.findOne({
      where: {
        descricao: {
          [Op.iLike]: `%${email}%`,
        },
        dadosid: pessoa.id,
      },
      transaction: t,
    });

    if (verifyExistsEmail) {
      await verifyExistsEmail.destroy({ transaction: t });
    }

    if (ema_in_principal) {
      const verifyEmailPrincipal = await Email.findOne({
        where: {
          ema_in_principal: true,
          dadosid: pessoa.id,
        },
        transaction: t,
      });

      if (verifyEmailPrincipal) await verifyEmailPrincipal.update({ ema_in_principal: false }, { transaction: t });
    }

    const newEmail = await Email.create(
      {
        descricao: email,
        tipoemailid: tipoemail,
        dadosid: pessoa.id,
        vinculoid,
        ema_in_principal,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();

    return newEmail;
  }
}
