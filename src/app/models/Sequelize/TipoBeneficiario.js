/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoBeneficiario extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        codigoans: Sequelize.INTEGER,
        codigodmed: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_tipobeneficiario',
      }
    );

    return this;
  }
}
