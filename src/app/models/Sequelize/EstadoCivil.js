/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class EstadoCivil extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
      },
      { sequelize, tableName: 'sp_estadocivil' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.PessoaFisica, {
      foreignKey: 'estadocivilid',
    });
  }
}
