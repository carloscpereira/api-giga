/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Conta extends Model {
  static init(sequelize) {
    super.init(
      {
        numero: Sequelize.BIGINT,
        tipocontaid: Sequelize.BIGINT,
        obs: Sequelize.TEXT,
        agenciaid: Sequelize.BIGINT,
        pessoaid: Sequelize.BIGINT,
        digito: Sequelize.STRING,
        operacao: Sequelize.STRING,
        razao: Sequelize.STRING,
        con_in_principal: Sequelize.BOOLEAN,
        id_cliente_banco: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cartao',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, {
      foreignKey: 'pessoaid',
      as: 'pessoa',
    });
  }
}
