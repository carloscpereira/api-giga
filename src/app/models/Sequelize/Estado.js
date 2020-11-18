/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Estado extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.BIGINT, field: 'codigo', primaryKey: true },
        codigo: Sequelize.STRING,
        sigla: Sequelize.STRING,
        nome_da_uf: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'uf',
      }
    );

    return this;
  }
}
