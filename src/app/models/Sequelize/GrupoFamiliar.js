/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class GrupoFamiliar extends Model {
  static init(sequelize) {
    super.init(
      {
        grupo: Sequelize.INTEGER,
        contratoid: Sequelize.INTEGER,
        // responsavelgrupoid: Sequelize.INTEGER,
        sequencia: Sequelize.INTEGER,
      },
      { sequelize, tableName: 'cn_grupofamiliar' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Contrato, {
      foreignKey: 'contratoid',
      as: 'contrato',
    });

    // this.hasMany(models.Pessoa, {
    //   through: models.AssociadoPF,
    // });

    this.belongsTo(models.Beneficiario, { foreignKey: 'responsavelgrupoid', as: 'responsavel' });

    this.hasMany(models.Beneficiario, {
      foreignKey: 'pessoabeneficiarioid',
      as: { plural: 'beneficiarios', singular: 'beneficiario' },
    });

    this.belongsToMany(models.Pessoa, {
      through: models.Beneficiario,
      otherKey: 'pessoabeneficiarioid',
      foreignKey: 'grupofamiliarid',
      as: { singular: 'pessoa', plural: 'pessoas' },
    });
  }
}
