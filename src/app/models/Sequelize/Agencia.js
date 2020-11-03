/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Agencia extends Model {
  static init(sequelize) {
    super.init(
      {
        bancoid: Sequelize.BIGINT,
        codigo: Sequelize.INTEGER,
        digito: Sequelize.INTEGER,
        descricao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'agencia',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Banco, {
      foreignKey: 'bancoid',
      as: 'banco',
    });
  }
}
