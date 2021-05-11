/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Especialidade extends Model {
  static init(sequelize) {
    super.init(
      {
        codigo: Sequelize.INTEGER,
        descricao: Sequelize.STRING,
        antiga: Sequelize.BIGINT,
        a1: Sequelize.SMALLINT,
        a2: Sequelize.SMALLINT,
        a3: Sequelize.SMALLINT,
        a4: Sequelize.SMALLINT,
        a5: Sequelize.SMALLINT,
        a6: Sequelize.SMALLINT,
        a7: Sequelize.SMALLINT,
        a8: Sequelize.SMALLINT,
        a9: Sequelize.SMALLINT,
        a10: Sequelize.SMALLINT,
        a11: Sequelize.SMALLINT,
      },
      {
        sequelize,
        tableName: 'cn_especialidade',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Contrato, {
      through: models.EspecialidadeClinica,
      otherKey: 'numerocontrato',
      foreignKey: 'especialidadeid',
      as: 'contratos',
    });

    this.belongsToMany(models.Procedimento, {
      through: models.RolCoberturaPlanoProcedimentos,
      otherKey: 'procedimentoid',
      foreignKey: 'especialidadeid',
      as: 'procedimentos',
    });
  }
}
