/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Contrato extends Model {
  static init(sequelize) {
    super.init(
      {
        numerocontrato: Sequelize.STRING,
        numeroproposta: Sequelize.STRING,
        operadoraid: Sequelize.BIGINT,
        statusid: Sequelize.BIGINT,
        dataadesao: Sequelize.DATE,
        datacancelamento: Sequelize.DATE,
        dataregistrosistema: Sequelize.DATE,
        datalimitecancelamento: Sequelize.DATE,
        datainicialvigencia: Sequelize.DATE,
        datafinalvigencia: Sequelize.DATE,
        ciclovigenciacontrato: Sequelize.INTEGER,
        quantidademesesvigencia: Sequelize.INTEGER,
        temporeativacao: Sequelize.DATE,
        prazolimitebloqueio: Sequelize.INTEGER,
        obs: Sequelize.STRING,
        tipocontratoid: Sequelize.INTEGER,
        tipotabelausoid: Sequelize.INTEGER,
        descontotabelauso: Sequelize.DOUBLE,
        chaveex: Sequelize.INTEGER,
        tipodecarteiraid: Sequelize.INTEGER,
        databloqueio: Sequelize.DATE,
        motivoadesaoid: Sequelize.INTEGER,
        motivocancelamentoid: Sequelize.INTEGER,
        datareativacao: Sequelize.DATE,
        bloqueadopesquisa: Sequelize.BOOLEAN,
        localid: Sequelize.INTEGER,
        con_in_renovacao_auto: Sequelize.BOOLEAN,
        con_dt_geracao_parcelas: Sequelize.DATE,
        con_in_situacao: Sequelize.SMALLINT,
        con_id_regra_vigencia: Sequelize.INTEGER,
        importado: Sequelize.CHAR,
        con_nu_prazo_cancela_inad: Sequelize.INTEGER,
        tipodecarteiracontratoid: Sequelize.INTEGER,
        id_gld: Sequelize.INTEGER,
        centrocustoid: Sequelize.BIGINT,
      },
      { sequelize, tableName: 'cn_contrato' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Titulo, {
      foreignKey: 'numerocontratoid',
      as: 'titulo',
    });
  }
}
