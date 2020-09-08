/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Email extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        tipoemailid: Sequelize.BIGINT,
        dadosid: Sequelize.BIGINT,
        vinculoid: Sequelize.BIGINT,
        ema_in_principal: Sequelize.BOOLEAN,
        site: Sequelize.STRING,
      },
      { sequelize, tableName: 'sp_email' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Vinculo, {
      as: 'vinculo',
      foreignKey: 'vinculoid',
    });

    this.belongsTo(models.Pessoa, {
      as: 'pessoa',
      foreignKey: 'dadosid',
    });
  }
}
