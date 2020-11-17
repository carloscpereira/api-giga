import Conta from '../models/Sequelize/Conta';

export default class AdicionarContaService {
  static async execute({
    pessoa,
    sequelize,
    transaction,
    numero,
    tipocontaid,
    obs,
    agenciaid,
    digito,
    operacao,
    razao,
    con_in_principal,
  }) {
    const t = transaction || (await sequelize.transaction());

    const verifyExistsConta = await Conta.findOne({
      numero,
      agenciaid,
      tipocontaid,
      digito,
      operacao,
      pessoaid: pessoa.id,
    });

    if (verifyExistsConta) return;

    if (con_in_principal) {
      const verifyContaPrincipal = await Conta.findOne({
        con_in_principal: true,
        pessoaid: pessoa.id,
      });

      if (verifyContaPrincipal) await verifyContaPrincipal.update({ con_in_principal: false }, { transaction: t });
    }

    await Conta.create(
      {
        numero,
        tipocontaid,
        obs,
        agenciaid,
        pessoaid: pessoa.id,
        digito,
        operacao,
        razao,
        con_in_principal,
      },
      { transaction: t }
    );
  }
}
