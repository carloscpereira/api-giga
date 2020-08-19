/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class LogCartaoCredito extends Model {
  static init(sequelize) {
    super.init(
      {
        tid: Sequelize.STRING,
        authorization_code: Sequelize.STRING,
        payment_id: Sequelize.STRING,
        return_message: Sequelize.STRING,
        return_code: Sequelize.STRING,
        establishment: Sequelize.STRING,
        parcela_id: { type: Sequelize.INTEGER, field: 'parcelaid' },
        response: Sequelize.TEXT,
        processamento: Sequelize.DATE,
      },
      {
        sequelize,
        tableName: 'log_cartaocredito',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Parcela, { foreignKey: 'parcelaid', as: 'parcela' });
  }
}
