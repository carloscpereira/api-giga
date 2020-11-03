/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoAreaAbrangencia extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_tipoareaabrangencia',
      }
    );

    return this;
  }
}
