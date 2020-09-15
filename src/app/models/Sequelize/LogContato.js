/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class LogContato extends Model {
  static init(sequelize) {
    super.init(
      {
        tipo_id: Sequelize.BIGINT,
        body_request: Sequelize.STRING,
        response_request: Sequelize.STRING,
        return_code: Sequelize.STRING,
        parcela_id: Sequelize.INTEGER,
        is_error: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'sys_log_contato',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Parcela, { foreignKey: 'parcela_id', as: 'parcela' });
  }
}
