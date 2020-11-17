import CartaoCredito from '../models/Sequelize/CartaoCredito';

export default class AdicionarCartaoCreditoService {
  static async execute({
    numerocartao,
    codigosegurancacartao,
    tipocartaoid,
    pessoa,
    validadecartao,
    diadevencimento,
    nome_titular,
    car_in_principal,
    sequelize,
    transaction,
  }) {
    const t = transaction || (await sequelize.transaction());

    const verifyExistsCartaoCredito = await CartaoCredito.findOne({
      codigosegurancacartao,
      validadecartao,
      nome_titular,
    });

    if (verifyExistsCartaoCredito) return;

    if (car_in_principal) {
      const verifyCartaoCreditoPrincipal = await CartaoCredito.findOne({
        car_in_principal: true,
        dadosid: pessoa.id,
      });

      if (verifyCartaoCreditoPrincipal)
        await verifyCartaoCreditoPrincipal.update({ car_in_principal: false }, { transaction: t });
    }

    await CartaoCredito.create(
      {
        numerocartao,
        codigosegurancacartao,
        tipocartaoid,
        pessoaid: pessoa.id,
        validadecartao,
        diadevencimento,
        nome_titular,
        car_in_principal,
      },
      { transaction: t }
    );
  }
}
