/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Documento extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
      },
      { sequelize, tableName: 'tipodocumento' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Parcela, {
      foreignKey: 'tipodocumentoid',
      as: 'parcela',
    });
  }
}
