/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Banco extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.STRING,
        digito: Sequelize.INTEGER,
        descricao_boleto: Sequelize.STRING,
        logomarca_boleto: Sequelize.BLOB,
        codigo_moeda: Sequelize.CHAR,
        site: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'banco',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Agencia, {
      foreignKey: 'bancoid',
      as: { plural: 'agencias', singular: 'agencia' },
    });
  }
}
