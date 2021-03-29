/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Ocorrencia extends Model {
  static init(sequelize) {
    super.init(
      {
        dataocorrencia: Sequelize.DATE,
        datavalidade: Sequelize.DATE,
        parcela_id: Sequelize.BIGINT,
        statusid: Sequelize.INTEGER,
        obs: Sequelize.STRING,
        pessoaagendante: Sequelize.INTEGER,
        descricao: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        numerocontratoid: Sequelize.INTEGER,
        grupoocorrenciaid: Sequelize.INTEGER,
        subgrupoocorrencia: Sequelize.INTEGER,
        departamentoid: Sequelize.INTEGER,
        setorid: Sequelize.INTEGER,
        calendario_id: Sequelize.INTEGER,
        tipoocorrencia_calendario: Sequelize.INTEGER,
        ocorrenciasistema: Sequelize.STRING,
        horaocorrencia: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'cn_ocorrenciacontrato',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Contrato, {
      foreignKey: 'numerocontratoid',
      as: 'contrato',
    });
  }
}
