const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class ParcelaLote {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query('SELECT * FROM parcelalote');

      if (!rows.length) return null;

      return rows;
    } catch (error) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async findPK(id) {
    try {
      const {
        rows,
      } = await this.pool.query('SELECT * FROM parcelalote WHERE id = $1', [
        id,
      ]);
      if (!rows.length) return DEFAULT_ERR_RESPONSE;
      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async findParcela(id) {
    try {
      const {
        rows,
      } = await this.pool.query(
        'SELECT * FROM parcelalote WHERE parcelaid = $1',
        [id]
      );

      if (!rows.length) return null;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async create(data) {
    const {
      parcelaid = null,
      pal_id_lote_pagamento = null,
      pal_dt_pagamento = new Date(),
    } = data;

    try {
      const {
        rows,
      } = await this.pool.query(
        'INSERT INTO parcelalote (parcelaid, pal_id_lote_pagamento, pal_dt_pagamento) VALUES ($1, $2, $3) RETURNING *',
        [parcelaid, pal_id_lote_pagamento, pal_dt_pagamento]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
