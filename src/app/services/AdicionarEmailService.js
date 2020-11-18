import { Op } from 'sequelize';

import Email from '../models/Sequelize/Email';

export default class AdicionarEmailService {
  static async execute({ pessoa, email = '', ema_in_principal, vinculoid, tipoemail, sequelize, transaction }) {
    const t = transaction || (await sequelize.transaction());

    const verifyExistsEmail = await Email.findOne({
      where: {
        descricao: {
          [Op.iLike]: `%${email}%`,
        },
      },
    });

    if (verifyExistsEmail) return;

    if (ema_in_principal) {
      const verifyEmailPrincipal = await Email.findOne({
        where: {
          ema_in_principal: true,
          dadosid: pessoa.id,
        },
      });

      if (verifyEmailPrincipal) await verifyEmailPrincipal.update({ ema_in_principal: false }, { transaction: t });
    }

    await Email.create(
      {
        descricao: email,
        tipoemailid: tipoemail,
        dadosid: pessoa.id,
        vinculoid,
        ema_in_principal,
      },
      { transaction: t }
    );
  }
}
