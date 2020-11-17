/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class PessoaOrganograma extends Model {
  static init(sequelize) {
    super.init(
      {
        pessoaid: Sequelize.BIGINT,
        organogramaid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'sp_pessoaorganograma',
      }
    );

    return this;
  }

  // static associate(models) {}
}
