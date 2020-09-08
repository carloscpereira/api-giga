/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Telefone extends Model {
  static init(sequelize) {
    super.init(
      {
        numero: Sequelize.STRING,
        ramal: Sequelize.STRING,
        tipotelefoneid: Sequelize.BIGINT,
        dadosid: Sequelize.BIGINT,
        vinculoid: Sequelize.BIGINT,
        tel_in_principal: Sequelize.BOOLEAN,
        enderecoid: Sequelize.BIGINT,
      },
      { sequelize, tableName: 'sp_telefone' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Endereco, {
      as: 'endereco',
      foreignKey: 'enderecoid',
    });

    this.belongsTo(models.Vinculo, {
      as: 'vinculo',
      foreignKey: 'vinculoid',
    });

    this.belongsTo(models.Pessoa, {
      as: 'telefone',
      foreignKey: 'dadosid',
    });
  }
}
