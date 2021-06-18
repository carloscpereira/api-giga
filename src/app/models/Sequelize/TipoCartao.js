/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoCartao extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        modpagamentoid: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'tipocartao',
      }
    );

    return this;
  }
}
