/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoTabelaUso extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        tabelaantiga: Sequelize.STRING,
        regiao: Sequelize.STRING,
        dataalteracao: Sequelize.DATE,
        pessoaid: Sequelize.INTEGER,
        observacao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'cn_tipotabelauso',
      }
    );

    return this;
  }

  // static associate(models) {}
}
