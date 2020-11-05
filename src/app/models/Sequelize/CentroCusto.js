/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class CentroCusto extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        quantidadefuncionario: Sequelize.INTEGER,
        numerometroquadrado: Sequelize.DOUBLE,
        numerofator: Sequelize.DOUBLE,
        departamentoid: Sequelize.BIGINT,
        setorid: Sequelize.BIGINT,
        empresaid: Sequelize.BIGINT,
        nomefantasiacarteira: Sequelize.STRING,
        localid: Sequelize.BIGINT,
        assuntoid: Sequelize.BIGINT,
        search: {
          type: Sequelize.VIRTUAL,
          get() {
            const departamento = this.departamento && this.departamento ? this.departamento.descricao.trim() : '';
            const setor = this.setor && this.setor.descricao ? this.setor.descricao.trim() : '';
            const razaoSocial = this.empresa && this.empresa.razaosocial ? this.empresa.razaosocial.trim() : '';
            const nomeFantasia = this.empresa && this.empresa.nomefantasia ? this.empresa.nomefantasia.trim() : '';

            return `${razaoSocial || ''} (${nomeFantasia || ''}) - ${departamento || ''} - ${setor || ''}`;
          },
        },
      },
      { sequelize, tableName: 'centrocusto' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.PessoaJuridica, {
      foreignKey: 'empresaid',
      as: 'empresa',
    });

    this.belongsTo(models.Setor, {
      foreignKey: 'setorid',
      as: 'setor',
    });

    this.belongsTo(models.Departamento, {
      foreignKey: 'departamentoid',
      as: 'departamento',
    });
  }
}
