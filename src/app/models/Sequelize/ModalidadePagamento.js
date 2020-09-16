/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class ModalidadePagamento extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        cartaocredito: Sequelize.STRING,
      },
      { sequelize, tableName: 'modpagamento' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.TipoCarteira, {
      foreignKey: 'modalidadepagamentoid',
      as: { singular: 'carteira', plural: 'carteiras' },
    });
  }
}
