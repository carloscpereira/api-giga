/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Produto extends Model {
  static init(sequelize) {
    super.init(
      {
        planoid: Sequelize.BIGINT,
        versaoid: Sequelize.BIGINT,
        segmentacaoassistencialid: Sequelize.BIGINT,
        participacaofinanceiraid: Sequelize.BIGINT,
        tipocontratacaoid: Sequelize.BIGINT,
        tipoareaabrangenciaid: Sequelize.BIGINT,
        areacoberturaid: Sequelize.BIGINT,
        limitediasbloqueio: Sequelize.INTEGER,
        registroans: Sequelize.STRING,
        codigo: Sequelize.INTEGER,
        limitemensalautorizacao: Sequelize.INTEGER,
        pro_nu_parcelas_financiadas: Sequelize.INTEGER,
        pro_id_tipo_contrato: Sequelize.BIGINT,
        pro_id_regra_vigencia: Sequelize.INTEGER,
        prd_in_bloqueado: Sequelize.BOOLEAN,
        prd_in_renovaauto: Sequelize.BOOLEAN,
        descricao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'cn_produto',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Plano, {
      foreignKey: 'planoid',
      as: 'plano',
    });

    this.belongsTo(models.VersaoPlano, {
      foreignKey: 'versaoid',
      as: 'versao_plano',
    });

    this.belongsTo(models.SegmentacaoAssistencial, {
      foreignKey: 'segmentacaoassistencialid',
      as: 'segmentacao_assistencial',
    });

    this.belongsTo(models.ParticipacaoFinanceira, {
      foreignKey: 'participacaofinanceiraid',
      as: 'participacao_financeira',
    });

    this.belongsTo(models.TipoContratacao, {
      foreignKey: 'tipocontratacaoid',
      as: 'tipo_contratacao',
    });

    this.belongsTo(models.TipoAreaAbrangencia, {
      foreignKey: 'tipoareaabrangenciaid',
      as: 'tipo_area_abrangencia',
    });

    this.belongsTo(models.AreaCobertura, {
      foreignKey: 'areacoberturaid',
      as: 'area_cobertura',
    });

    this.belongsTo(models.TipoContrato, {
      foreignKey: 'pro_id_tipo_contrato',
      as: 'tipo_contrato',
    });

    this.belongsTo(models.RegraVigenciaContrato, {
      foreignKey: 'pro_id_regra_vigencia',
      as: 'regra_vigencia',
    });
  }
}
