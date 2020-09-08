/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Vinculo extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        tipopessoa: Sequelize.CHAR,
        sistema: Sequelize.CHAR,
      },
      { sequelize, tableName: 'sp_vinculo' }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Vinculo, {
      through: models.PessoaVinculo,
      as: { singular: 'pessoa', plural: 'pessoas' },
      foreignKey: 'vinculoid',
      otherKey: 'pessoaid',
    });
  }
}
