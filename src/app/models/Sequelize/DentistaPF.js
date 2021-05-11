/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class DentistaPF extends Model {
  static init(sequelize) {
    super.init(
      {
        dentistaid: Sequelize.BIGINT,
        limiteprocedimento: Sequelize.INTEGER,
        areacoberturaid: Sequelize.BIGINT,
        regrafaturamentoid: Sequelize.BIGINT,
        numerocbo: Sequelize.STRING,
        numerocnes: Sequelize.STRING,
        numerolote: Sequelize.STRING,
        uso: Sequelize.DOUBLE,
        limitefinanceiro: Sequelize.DOUBLE,
        prazolimiteglosa: Sequelize.INTEGER,
        percentualrepasse: Sequelize.DOUBLE,
      },
      {
        sequelize,
        tableName: 'cn_dentistapf',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.PessoaFisica, { as: 'pessoa', foreignKey: 'dentistaid' });
    this.belongsTo(models.RegraFaturamento, { as: 'regra_faturamento', foreignKey: 'regrafaturamentoid' });
    this.belongsTo(models.Contrato, { as: 'contrato', foreignKey: 'id' });
    this.belongsTo(models.AreaCobertura, { as: 'area_cobertura', foreignKey: 'areacoberturaid' });
    this.belongsToMany(models.Especialidade, {
      through: models.EspecialidadeDentista,
      foreignKey: 'numerocontrato',
      otherKey: 'especialidadeid',
      as: 'especialidades',
    });
  }
}
