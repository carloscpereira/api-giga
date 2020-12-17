/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoBaixa extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'tipobaixa',
      }
    );

    return this;
  }
}
