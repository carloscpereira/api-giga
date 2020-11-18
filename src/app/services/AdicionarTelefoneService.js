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
    const t = transaction || (await sequelize.transaction());

    const verifyExistsTelefone = await Telefone.findOne({
      where: {
        numero,
        ramal,
        dadosid: pessoa.id,
      },
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
      });

      if (verifyTelefonePrincipal)
        await verifyTelefonePrincipal.update({ tel_in_principal: false }, { transaction: t });
    }

    await Telefone.create(
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
  }
}
