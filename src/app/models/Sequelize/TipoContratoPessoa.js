/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoContratoPessoa extends Model {
  static init(sequelize) {
    super.init(
      {
        tiposcontratoid: Sequelize.BIGINT,
        pessoaid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cn_tiposcontrato_pessoa',
      }
    );

    return this;
  }
}
