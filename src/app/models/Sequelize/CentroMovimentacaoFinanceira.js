/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class CentroMovimentacaoFinanceira extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        grupocmfid: Sequelize.INTEGER,
        cobravel: Sequelize.INTEGER,
        sistema: Sequelize.CHAR,
      },
      {
        sequelize,
        tableName: 'cmf',
      }
    );

    return this;
  }
}
