/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Endereco extends Model {
  static init(sequelize) {
    super.init(
      {
        tipoenderecoid: Sequelize.BIGINT,
        dadosid: Sequelize.BIGINT,
        logradouro: Sequelize.STRING,
        bairro: Sequelize.STRING,
        cidade: Sequelize.STRING,
        estado: Sequelize.STRING,
        cep: Sequelize.STRING,
        complemento: Sequelize.STRING,
        vinculoid: Sequelize.BIGINT,
        numero: Sequelize.INTEGER,
        end_in_principal: Sequelize.BOOLEAN,
        id_estado: Sequelize.INTEGER,
        id_cidade: Sequelize.INTEGER,
        end_latitude: Sequelize.STRING,
        end_longitude: Sequelize.STRING,
        end_altitude: Sequelize.NUMBER,
        bairroid: Sequelize.INTEGER,
      },
      { sequelize, tableName: 'sp_endereco' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Vinculo, {
      as: 'vinculo',
      foreignKey: 'vinculoid',
    });

    this.belongsTo(models.Pessoa, {
      as: 'pessoa',
      foreignKey: 'dadosid',
    });
  }
}
