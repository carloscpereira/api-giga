/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class ParcelaLote extends Model {
  static init(sequelize) {
    super.init(
      {
        parcelaid: Sequelize.INTEGER,
        pal_id_lote_pagamento: Sequelize.BIGINT,
        pal_dt_pagamento: Sequelize.DATE,
      },
      {
        indexes: [
          {
            unique: true,
            fields: ['pal_id_lote_pagamento', 'parcelaid'],
          },
        ],
        sequelize,
        tableName: 'parcelalote',
      }
    );

    return this;
  }
}
