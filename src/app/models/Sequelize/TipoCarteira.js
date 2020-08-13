/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class TipoCarteira extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        modalidadepagamentoid: Sequelize.INTEGER,
        bancoid: Sequelize.INTEGER,
        tipocartaoid: Sequelize.INTEGER,
        carteira: Sequelize.STRING,
        modpagantigo: Sequelize.SMALLINT,
        transferenciaoutrobanco: Sequelize.CHAR,
        boletocomregistro: Sequelize.CHAR,
        adicionalcomissao: Sequelize.CHAR,
        cod_remessa: Sequelize.STRING,
        cod_cancelamento: Sequelize.STRING,
        img_doc_cobranca: Sequelize.BLOB,
        deposito_identificado: Sequelize.CHAR,
        diafechamentoconsignataria: Sequelize.INTEGER,
        tdc_in_documento_cobranca: Sequelize.BOOLEAN,
        tdc_in_bloqueio_cadastro: Sequelize.BOOLEAN,
        nu_prazo_inadimplencia_cobranca: Sequelize.INTEGER,
        nu_prazo_tolerancia_autorizacao: Sequelize.INTEGER,
        nu_prazo_bloqueio_contrato: Sequelize.INTEGER,
      },
      { sequelize, tableName: 'cn_tipodecarteira' }
    );

    return this;
  }
}
