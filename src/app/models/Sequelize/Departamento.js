/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Departamento extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: { type: Sequelize.STRING, field: 'departamento' },
        codantigo: Sequelize.INTEGER,
        tipoconsignataria: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'sp_departamento',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.CentroCusto, {
      foreignKey: 'departamentoid',
      as: { plural: 'centrocustos', singular: 'centrocusto' },
    });
  }
}
