/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Setor extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: { type: Sequelize.STRING, field: 'setor' },
      },
      {
        sequelize,
        tableName: 'sp_setor',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.CentroCusto, {
      foreignKey: 'setorid',
      as: { plural: 'centrocustos', singular: 'centrocusto' },
    });
  }
}
