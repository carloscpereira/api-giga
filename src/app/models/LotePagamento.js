const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class LotePagamento {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query('SELECT * FROM lotepagamento');

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
      } = await this.pool.query('SELECT * FROM lotepagamento WHERE id = $1', [
        id,
      ]);
      if (!rows.length) return DEFAULT_ERR_RESPONSE;
      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async update(data) {
    const {
      id = null,
      statusid = null,
      datacadastro = null,
      pessoausuarioid = null,
      lop_dt_baixa = null,
      lop_id_pessoa = null,
      lop_id_tipo_baixa = null,
      lop_in_tipo_movimento = null,
      lop_id_contrato = null,
      lop_in_cobranca = null,
      id_gld = null,
    } = data;

    try {
      const {
        rows,
      } = await this.pool.query(
        'UPDATE lotepagamento SET statusid = COALESCE($1, statusid), datacadastro = COALESCE($2, datacadastro), pessoausuarioid = COALESCE($3, pessoausuarioid), lop_dt_baixa = COALESCE($4, lop_dt_baixa), lop_id_pessoa = COALESCE($5, lop_id_pessoa), lop_id_tipo_baixa = COALESCE($6, lop_id_tipo_baixa), lop_in_tipo_movimento = COALESCE($7, lop_in_tipo_movimento), lop_id_contrato = COALESCE($8, lop_id_contrato), lop_in_cobranca = COALESCE($9, lop_in_cobranca), id_gld = COALESCE($10, id_gld) WHERE id = $11 RETURNING *',
        [
          statusid,
          datacadastro,
          pessoausuarioid,
          lop_dt_baixa,
          lop_id_pessoa,
          lop_id_tipo_baixa,
          lop_in_tipo_movimento,
          lop_id_contrato,
          lop_in_cobranca,
          id_gld,
          id,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return {
        error: DEFAULT_ERR_RESPONSE.error,
        data: {
          error: DEFAULT_ERR_RESPONSE.data.message,
          message: err.message,
        },
      };
    }
  }

  async create(data) {
    const {
      statusid = null,
      datacadastro = new Date(),
      pessoausuarioid = null,
      lop_dt_baixa = new Date(),
      lop_id_pessoa = null,
      lop_id_tipo_baixa = null,
      lop_in_tipo_movimento = null,
      lop_id_contrato = null,
      lop_in_cobranca = null,
      id_gld = null,
    } = data;
    try {
      const {
        rows,
      } = await this.pool.query(
        'INSERT INTO lotepagamento (statusid, datacadastro, pessoausuarioid, lop_dt_baixa, lop_id_pessoa, lop_id_tipo_baixa, lop_in_tipo_movimento, lop_id_contrato, lop_in_cobranca, id_gld) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [
          statusid,
          datacadastro,
          pessoausuarioid,
          lop_dt_baixa,
          lop_id_pessoa,
          lop_id_tipo_baixa,
          lop_in_tipo_movimento,
          lop_id_contrato,
          lop_in_cobranca,
          id_gld,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return {
        error: DEFAULT_ERR_RESPONSE.error,
        data: {
          error: DEFAULT_ERR_RESPONSE.data.message,
          message: err.message,
        },
      };
    }
  }
}
