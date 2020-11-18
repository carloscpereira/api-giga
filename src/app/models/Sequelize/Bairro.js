/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Bairro extends Model {
  static init(sequelize) {
    super.init(
      {
        municipioid: Sequelize.BIGINT,
        bairro: Sequelize.STRING,
        ibge: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'bairro',
      }
    );

    return this;
  }
}
