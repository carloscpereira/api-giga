/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class LotePagamento extends Model {
  static init(sequelize) {
    super.init(
      {
        statusid: Sequelize.INTEGER,
        datacadastro: Sequelize.DATE,
        pessoausuarioid: Sequelize.INTEGER,
        lop_dt_baixa: Sequelize.DATE,
        lop_id_pessoa: Sequelize.BIGINT,
        lop_id_tipo_baixa: Sequelize.INTEGER,
        lop_in_tipo_movimento: Sequelize.CHAR,
        lop_id_contrato: Sequelize.INTEGER,
        lop_in_cobranca: Sequelize.BOOLEAN,
        id_gld: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'lotepagamento',
        name: {
          singular: 'lote',
          plural: 'lotes',
        },
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Parcela, {
      through: 'parcelalote',
      as: 'parcelas',
      foreignKey: 'pal_id_lote_pagamento',
    });
    this.belongsTo(models.Contrato, {
      foreignKey: 'lop_id_contrato',
      as: 'contrato',
    });
  }
}
