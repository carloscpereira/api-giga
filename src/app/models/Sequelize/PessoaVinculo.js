/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class PessoaVinculo extends Model {
  static init(sequelize) {
    super.init(
      {
        pessoaid: Sequelize.BIGINT,
        vinculoid: Sequelize.BIGINT,
      },
      { sequelize, tableName: 'sp_pessoavinculo' }
    );

    return this;
  }
}
