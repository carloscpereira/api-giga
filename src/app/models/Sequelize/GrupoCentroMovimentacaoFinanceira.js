/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class GrupoCentroMovimentacaoFinanceira extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        tipomovimento: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'grupocmf',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.CentroMovimentacaoFinanceira, {
      foreignKey: 'grupocmfid',
      as: { singular: 'cmf', plural: 'cmfs' },
    });
  }
}
