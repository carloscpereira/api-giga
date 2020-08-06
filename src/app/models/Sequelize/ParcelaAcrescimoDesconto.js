/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class ParcelaAcrescimoDesconto extends Model {
  static init(sequelize) {
    super.init(
      {
        parcelaid: Sequelize.INTEGER,
        cmfid: Sequelize.INTEGER,
        valor: Sequelize.DOUBLE,
        porcent: Sequelize.DOUBLE,
        tipomovimento: Sequelize.CHAR,
        dataaplicacao: Sequelize.DATE,
        pessoausuarioid: Sequelize.INTEGER,
        tipoincidenciasigla: Sequelize.CHAR,
        ordem: Sequelize.INTEGER
      },
      {
        sequelize,
        tableName: 'parcela_acrescimo_desconto',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Parcela, {
      foreignKey: 'parcelaid',
      as: 'parcela',
    });
  }
}
