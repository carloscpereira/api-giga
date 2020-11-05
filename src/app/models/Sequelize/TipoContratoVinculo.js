/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoContratoVinculo extends Model {
  static init(sequelize) {
    super.init(
      {
        tiposcontratoid: Sequelize.BIGINT,
        vinculoid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cn_tiposcontrato_vinculo',
      }
    );

    return this;
  }

  // static associate(models) {}
}
