/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class RolCoberturaPlano extends Model {
  static init(sequelize) {
    super.init(
      {
        planoid: Sequelize.BIGINT,
        tipobeneficiarioid: Sequelize.INTEGER,
        codigo: Sequelize.INTEGER,
        versaoid: Sequelize.BIGINT,
      },
      {
        sequelize,
        tableName: 'cn_rolcoberturaplano',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Produto, {
      foreignKey: 'planoid',
      targetKey: 'planoid',
      scope: {
        versaoid: this.sequelize.where(
          this.sequelize.col('RolCoberturaPlano.versaoid'),
          '=',
          this.sequelize.col('produto.versaoid')
        ),
      },
      as: 'produto',
    });

    this.belongsToMany(models.Procedimento, {
      as: 'procedimentos',
      through: models.RolCoberturaPlanoProcedimentos,
      foreignKey: 'rolcoberturaplanoid',
      otherKey: 'procedimentoid',
    });

    this.belongsToMany(models.Especialidade, {
      as: 'especialidades',
      through: models.RolCoberturaPlanoProcedimentos,
      foreignKey: 'rolcoberturaplanoid',
      otherKey: 'especialidadeid',
    });

    this.hasMany(models.RolCoberturaPlanoProcedimentos, {
      foreignKey: 'rolcoberturaplanoid',
      as: 'rol_procedimentos',
    });
  }
}
