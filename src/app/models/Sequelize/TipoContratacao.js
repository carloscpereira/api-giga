/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoContratacao extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        tipocontratoid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cn_tipocontratacao',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.TipoContrato, { foreignKey: 'tipocontratoid', as: 'tipo_contrato' });
  }
}
