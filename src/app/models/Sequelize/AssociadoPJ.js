/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class AssociadoPJ extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.BIGINT, primaryKey: true },
        responsavelfinanceiroid: Sequelize.STRING,
        corretoravendedorid: Sequelize.BIGINT,
        valorcontrato: Sequelize.BIGINT,
        datavencimento: Sequelize.BIGINT,
        diavencimento: Sequelize.BOOLEAN,
        carteirausuarioparceriaid: Sequelize.STRING,
        carteiraantecipada: Sequelize.STRING,
        tipocarteiraid: Sequelize.STRING,
        sequenciaboleto: Sequelize.STRING,
        corretora: Sequelize.STRING,
        uso: Sequelize.STRING,
        diafaturamento: Sequelize.STRING,
        descontofatura: Sequelize.STRING,
        acrescimofatura: Sequelize.STRING,
        valormes: Sequelize.STRING,
        valorliquido: Sequelize.STRING,
        valordesconto: Sequelize.STRING,
        qtdparcela: Sequelize.STRING,
      },
      { sequelize, tableName: 'cn_associadopj' }
    );

    return this;
  }
}
