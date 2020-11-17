/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class CartaoCredito extends Model {
  static init(sequelize) {
    super.init(
      {
        bancoid: Sequelize.BIGINT,
        agenciaid: Sequelize.BIGINT,
        contaid: Sequelize.BIGINT,
        numerocartao: Sequelize.STRING,
        codigosegurancacartao: Sequelize.INTEGER,
        modalidadeid: Sequelize.BIGINT,
        tipocartaoid: Sequelize.BIGINT,
        pessoaid: Sequelize.BIGINT,
        validadecartao: Sequelize.DATE,
        diadevencimento: Sequelize.INTEGER,
        nome_titular: Sequelize.STRING,
        car_in_principal: Sequelize.BOOLEAN,
        contratoid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cartao',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, {
      foreignKey: 'pessoaid',
      as: 'pessoa',
    });
  }
}
