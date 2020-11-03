/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoOcorrencia extends Model {
  static init(sequelize) {
    super.init(
      {
        grupoid: Sequelize.BIGINT,
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        reativa_contrato: Sequelize.STRING,
        codigo_plano: Sequelize.CHAR,
        cancela_primeiro_ciclo: Sequelize.CHAR,
        prazoresolucao: Sequelize.INTEGER,
        oco_in_bloqueado: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'cn_tipocorrencia',
      }
    );

    return this;
  }
}
