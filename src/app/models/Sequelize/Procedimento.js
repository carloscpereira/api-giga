/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Procedimento extends Model {
  static init(sequelize) {
    super.init(
      {
        codigo: Sequelize.INTEGER,
        especialidadeid: Sequelize.BIGINT,
        descricao: Sequelize.STRING,
        prazovalidadeprocedimento: Sequelize.STRING,
        limitemaximoidade: Sequelize.INTEGER,
        limitemininoidade: Sequelize.INTEGER,
        obs: Sequelize.TEXT,
        uso: Sequelize.DOUBLE,
        temx: Sequelize.STRING,
        nivel: Sequelize.SMALLINT,
        naocontaevento: Sequelize.BOOLEAN,
        quantidademaxima: Sequelize.SMALLINT,
        liberado: Sequelize.BOOLEAN,
        tus_id_tuss_procedimento: Sequelize.BIGINT,
        leberado_old: Sequelize.BOOLEAN,
        pro_id_tipo_radar: Sequelize.INTEGER,
        prazovalidadeautorizacao: Sequelize.INTEGER,
        spc_id: Sequelize.INTEGER,
        obs_autorizacao: Sequelize.TEXT,
      },
      {
        sequelize,
        tableName: 'cn_procedimento',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Especialidade, { as: 'especialidade', foreignKey: 'especialidadeid' });
  }
}
