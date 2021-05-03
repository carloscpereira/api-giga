/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class RegraFaturamento extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        diapagamentofatura: Sequelize.INTEGER,
        diaencerramentofatura: Sequelize.INTEGER,
        periodoproducaonovafatura: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_tipofaturamento',
      }
    );

    return this;
  }
}
