/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class PessoaJuridica extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.BIGINT, primaryKey: true },
        tipodadosid: Sequelize.BIGINT,
        status: Sequelize.CHAR,
        usuario: Sequelize.CHAR,
        datacadastro: Sequelize.DATE,
        nomefantasia: Sequelize.STRING,
        razaosocial: Sequelize.STRING,
        cnpj: Sequelize.STRING,
        inscricaoestadual: Sequelize.STRING,
        inscricaomunicipal: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        codimportado: Sequelize.BIGINT,
        tipoimportado: Sequelize.CHAR,
        cod_orgao: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'sp_dadospessoajuridica',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, {
      as: { singular: 'pessoa', plural: 'pessoas' },
      foreignKey: 'id',
      constraints: false,
    });
    // this.hasMany(models.CentroCusto, {
    //   foreignKey: 'empresaid',
    //   as: {
    //     singular: 'centrocusto',
    //     plural: 'centrocustos',
    //   },
    // });
  }
}
