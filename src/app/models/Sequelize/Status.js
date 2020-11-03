/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Status extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        grupostatusid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'statusgrupo',
      }
    );

    return this;
  }

  // static associate(models) {}
}
