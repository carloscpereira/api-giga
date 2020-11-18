/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Cidade extends Model {
  static init(sequelize) {
    super.init(
      {
        codigo_uf: Sequelize.BIGINT,
        municipio_codigo: { type: Sequelize.BIGINT, primaryKey: true },
        municipio_nome: Sequelize.STRING,
        cep_inicial: Sequelize.STRING,
        cep_final: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'municipio',
      }
    );

    return this;
  }
}
