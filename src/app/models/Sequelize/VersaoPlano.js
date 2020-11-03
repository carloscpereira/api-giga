/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class VersaoPlano extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        quantidademinimabeneficiarios: Sequelize.INTEGER,
        quantidademaximabeneficiarios: Sequelize.INTEGER,
        periodovencimento: Sequelize.INTEGER,
        qtdparcelascustomizado: Sequelize.CHAR,
      },
      {
        sequelize,
        tableName: 'cn_versaoplano',
      }
    );

    return this;
  }
}
