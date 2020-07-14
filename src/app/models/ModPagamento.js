const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class ModPagamento {
  constructor(pool) {
    this.pool = pool;
  }

  async findPK(id) {
    try {
      const {
        rows,
      } = await this.pool.query('SELECT * FROM modpagamento WHERE id = $1', [
        id,
      ]);

      if (!rows.length) return null;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
