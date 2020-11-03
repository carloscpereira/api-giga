/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Titulo extends Model {
  static init(sequelize) {
    super.init(
      {
        vinculopessoaid: Sequelize.INTEGER,
        cmfid: Sequelize.INTEGER,
        tipodocumentoid: Sequelize.INTEGER,
        centrocustoid: Sequelize.INTEGER,
        statusid: Sequelize.INTEGER,
        numerocontratoid: Sequelize.INTEGER,
        numerodocumento: Sequelize.STRING,
        valor: Sequelize.DOUBLE,
        numerototalparcelas: Sequelize.INTEGER,
        numerodiavencimento: Sequelize.INTEGER,
        datavencimento: Sequelize.DATE,
        dataperiodoinicial: Sequelize.DATE,
        dataperiodofinal: Sequelize.DATE,
        datacadastro: Sequelize.DATE,
        obs: Sequelize.STRING,
        tipopessoa: Sequelize.STRING,
        pessoaid: Sequelize.BIGINT,
        pessoausuarioid: Sequelize.BIGINT,
        modpagamentoid: Sequelize.INTEGER,
        contratovendaid: Sequelize.BIGINT,
        tipodecarteiraid: Sequelize.INTEGER,
        gruopocmfid: Sequelize.INTEGER,
        ciclocontrato: Sequelize.INTEGER,
        parcelavenda: Sequelize.INTEGER,
        tipodespesa: Sequelize.STRING,
      },
      { sequelize, tableName: 'titulo' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Parcela, { foreignKey: 'tituloid', as: { singular: 'parcela', plural: 'parcelas' } });
    this.belongsTo(models.Contrato, {
      foreignKey: 'numerocontratoid',
      as: 'contrato',
    });
  }
}
