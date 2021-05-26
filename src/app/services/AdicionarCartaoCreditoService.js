import { Sequelize, Transaction } from 'sequelize';
import CartaoCredito from '../models/Sequelize/CartaoCredito';

export default class AdicionarCartaoCreditoService {
  static async execute({
    numerocartao = '',
    codigosegurancacartao = '',
    tipocartaoid,
    pessoa,
    validadecartao = '',
    diadevencimento = '',
    nome_titular = '',
    car_in_principal = false,
    sequelize,
    transaction,
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
    try {
      const verifyExistsCartaoCredito = await CartaoCredito.findOne({
        where: {
          codigosegurancacartao: codigosegurancacartao.toString(),
          validadecartao,
          nome_titular,
        },
        transaction: t,
      });

      if (verifyExistsCartaoCredito) {
        await verifyExistsCartaoCredito.destroy({ transaction: t });
      }

      if (car_in_principal) {
        const verifyCartaoCreditoPrincipal = await CartaoCredito.findOne({
          where: {
            car_in_principal: true,
            pessoaid: pessoa.id,
          },
          transaction: t,
        });

        if (verifyCartaoCreditoPrincipal)
          await verifyCartaoCreditoPrincipal.update({ car_in_principal: false }, { transaction: t });
      }

      const newCartaoCredito = await CartaoCredito.create(
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

      if (!transaction) await t.commit();

      return newCartaoCredito;
    } catch (error) {
      if (!transaction) await t.rollback();

      throw error;
    }
  }
}
