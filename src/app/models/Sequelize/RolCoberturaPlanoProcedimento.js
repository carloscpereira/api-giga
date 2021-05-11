/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';
import RolCoberturaPlano from './RolCoberturaPlano';

export default class RolCoberturaPlanoProcedimentos extends Model {
  static init(sequelize) {
    super.init(
      {
        procedimentoid: Sequelize.BIGINT,
        prazocarencia: Sequelize.INTEGER,
        qtdeminimacontribuicoes: Sequelize.INTEGER,
        rolcoberturaplanoid: Sequelize.INTEGER,
        especialidadeid: Sequelize.INTEGER,
        coparticipacao: Sequelize.CHAR,
        percentualcoparticipacao: Sequelize.DOUBLE,
      },
      {
        sequelize,
        tableName: 'cn_rolcoberturaplanoprocedimento',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.RolCoberturaPlano, { foreignKey: 'rolcoberturaplanoid', as: 'rol_cobertura' });
  }
}
