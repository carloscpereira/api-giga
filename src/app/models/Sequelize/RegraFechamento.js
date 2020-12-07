/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class RegraFechamento extends Model {
  static init(sequelize) {
    super.init(
      {
        tiposcontrato_id: Sequelize.BIGINT,
        centrocusto_id: Sequelize.BIGINT,
        tipodecarteira_id: Sequelize.BIGINT,
        vencimento: Sequelize.INTEGER,
        fechamento: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_tipocontratacao',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.TipoContrato, { foreignKey: 'tiposcontrato_id', as: 'tipo_contrato' });
    this.belongsTo(models.CentroCusto, { foreignKey: 'centrocusto_id', as: 'centro_custo' });
    this.belongsTo(models.TipoCarteira, { foreignKey: 'tipodecarteira_id', as: 'tipo_carteira' });
  }
}
