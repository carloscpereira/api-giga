const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class FormaPagamento {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query('SELECT * FROM formapagamento');

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
      } = await this.pool.query('SELECT * FROM formapagamento WHERE id = $1', [
        id,
      ]);
      if (!rows.length) return DEFAULT_ERR_RESPONSE;
      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async create(data) {
    const {
      parcelaid = null,
      agenciaid = null,
      contaid = null,
      numerocheque = null,
      numerocartao = null,
      numerodocumento = null,
      numeromatricula = null,
      numerotransacao = null,
      validadecartao = null,
      tipodecarteiraid = null,
      numeroempresa = null,
      tipocartaoid = null,
      obs = null,
      numeroboleto = null,
      codigosegurancacartao = null,
      valor = null,
      centrocustoid = null,
      nome_emitente = null,
      contacheque = null,
      fop_in_conciliado = true,
      fop_in_pre_conciliacao = false,
      che_id_cheque = null,
    } = data;

    try {
      const {
        rows,
      } = await this.pool.query(
        'INSERT INTO formapagamento (parcelaid, agenciaid, contaid, numerocheque, numerocartao, numerodocumento, numeromatricula, numerotransacao, validadecartao, tipodecarteiraid, numeroempresa, tipocartaoid, obs, numeroboleto, codigosegurancacartao, valor, centrocustoid, nome_emitente, contacheque, fop_in_conciliado, fop_in_pre_conciliacao, che_id_cheque) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *',
        [
          parcelaid,
          agenciaid,
          contaid,
          numerocheque,
          numerocartao,
          numerodocumento,
          numeromatricula,
          numerotransacao,
          validadecartao,
          tipodecarteiraid,
          numeroempresa,
          tipocartaoid,
          obs,
          numeroboleto,
          codigosegurancacartao,
          valor,
          centrocustoid,
          nome_emitente,
          contacheque,
          fop_in_conciliado,
          fop_in_pre_conciliacao,
          che_id_cheque,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
