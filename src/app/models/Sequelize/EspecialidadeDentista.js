/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class EspecialidadeDentista extends Model {
  static init(sequelize) {
    super.init(
      {
        dentistapfid: Sequelize.INTEGER,
        especialidadeid: Sequelize.INTEGER,
        procedimento: Sequelize.INTEGER,
        numerocontrato: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_especialidade_dentista',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Contrato, { foreignKey: 'numerocontrato', as: 'contrato' });
    this.belongsTo(models.Procedimento, { foreignKey: 'procedimento', as: 'procedimentos' });
    this.belongsTo(models.Especialidade, { foreignKey: 'especialidadeid', as: 'especialidade' });
    this.belongsTo(models.PessoaFisica, { foreignKey: 'dentistapfid', as: 'pessoa' });
  }
}
