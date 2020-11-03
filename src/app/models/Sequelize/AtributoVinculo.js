/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class AtributoVinculo extends Model {
  static init(sequelize) {
    super.init(
      {
        pessoaid: Sequelize.BIGINT,
        campo: Sequelize.BIGINT,
        vinculoid: Sequelize.BIGINT,
        dadocampo: Sequelize.STRING,
      },
      { sequelize, tableName: 'sp_pessoaatributovinculo' }
    );

    return this;
  }
}
