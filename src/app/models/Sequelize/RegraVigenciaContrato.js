/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class RegraVigenciaContrato extends Model {
  static init(sequelize) {
    super.init(
      {
        mesesvigencia: Sequelize.INTEGER,
        prazobloqueio: Sequelize.INTEGER,
        prazocancelamento: Sequelize.INTEGER,
        prazoreativacao: Sequelize.INTEGER,
        rvc_nu_prazo_geracao_parcelas: Sequelize.INTEGER,
        rvc_ds_vigencia_contrato: Sequelize.STRING,
        rvc_nu_prazo_cancela_inad: Sequelize.INTEGER,
        rvc_nu_intervalo_adesao_venc: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'cn_regravigenciacontrato',
      }
    );

    return this;
  }
}
