/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoContrato extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        sigla: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'cn_tiposcontrato',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Contrato, {
      as: { singular: 'contrato', plural: 'contratos' },
      foreignKey: 'tipocontratoid',
    });
  }
}
