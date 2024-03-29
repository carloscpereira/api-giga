/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Parcela extends Model {
  static init(sequelize) {
    super.init(
      {
        tituloid: Sequelize.INTEGER,
        pessoausuarioid: Sequelize.INTEGER,
        tipodocumentoid: Sequelize.INTEGER,
        numerodocumento: Sequelize.STRING,
        taxajuro: Sequelize.STRING,
        taxamora: Sequelize.STRING,
        numero: Sequelize.INTEGER,
        datavencimento: Sequelize.DATE,
        datacadastramento: Sequelize.DATE,
        numerotransacao: Sequelize.STRING,
        statusgrupoid: Sequelize.INTEGER,
        valor: Sequelize.STRING,
        linhadigitavel: Sequelize.STRING,
        codigobarras: Sequelize.STRING,
        taxaboleto: Sequelize.STRING,
        nossonumero: Sequelize.STRING,
        seqboleto: Sequelize.INTEGER,
        statusarquivo: Sequelize.BOOLEAN,
        cobranca_cancelada: Sequelize.BOOLEAN,
        valor_bruto: Sequelize.STRING,
        pcl_in_cobranca: Sequelize.BOOLEAN,
        pcl_in_pause: Sequelize.BOOLEAN,
      },
      { sequelize, tableName: 'parcela' }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.FormaPagamento, {
      foreignKey: 'parcelaid',
      as: { singular: 'pagamento', plural: 'pagamentos' },
    });
    this.belongsTo(models.Titulo, { foreignKey: 'tituloid', as: 'titulo' });
    this.belongsTo(models.Documento, {
      foreignKey: 'tipodocumentoid',
      as: 'documento',
    });
    this.hasMany(models.LogCartaoCredito, {
      foreignKey: 'parcelaid',
      as: 'log_cartao',
    });
    this.hasMany(models.ParcelaAcrescimoDesconto, {
      foreignKey: 'parcelaid',
      as: { singular: 'desconto', plural: 'descontos' },
    });
    this.belongsToMany(models.LotePagamento, {
      through: models.ParcelaLote,
      as: { singular: 'lote', plural: 'lotes' },
      foreignKey: 'parcelaid',
      otherKey: 'pal_id_lote_pagamento',
    });
  }
}
