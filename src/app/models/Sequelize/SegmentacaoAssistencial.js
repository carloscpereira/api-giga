/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class SegmentacaoAssistencial extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_segmentacaoassistencial',
      }
    );

    return this;
  }
}
