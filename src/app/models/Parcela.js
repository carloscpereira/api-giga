/* eslint-disable no-unused-vars */
import ParcelaLote from './ParcelaLote';
import FormaPagamento from './FormaPagamento';

const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class Parcela {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query('SELECT * FROM parcela');

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
      } = await this.pool.query('SELECT * FROM parcela WHERE id = $1', [id]);
      if (!rows.length) return DEFAULT_ERR_RESPONSE;
      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async update(data) {
    console.log(data);

    const {
      id = null,
      tituloid = null,
      pessoausuarioid = null,
      tipodocumentoid = null,
      numerodocumento = null,
      taxajuro = null,
      taxamora = null,
      numero = null,
      datavencimento = null,
      datacadastramento = null,
      numerotransacao = null,
      statusgrupoid = null,
      valor = null,
      linhadigitavel = null,
      codigobarras = null,
      taxaboleto = null,
      nossonumero = null,
      seqboleto = null,
      statusarquivo = null,
      cobranca_cancelada = null,
      valor_bruto = null,
      pcl_in_cobranca = null,
    } = data;
    try {
      const {
        rows,
      } = await this.pool.query(
        'UPDATE parcela SET tituloid = COALESCE($1, tituloid),pessoausuarioid = COALESCE($2, pessoausuarioid),tipodocumentoid = COALESCE($3, tipodocumentoid),numerodocumento = COALESCE($4, numerodocumento),taxajuro = COALESCE($5, taxajuro),taxamora = COALESCE($6, taxamora),numero = COALESCE($7, numero),datavencimento = COALESCE($8, datavencimento),datacadastramento = COALESCE($9, datacadastramento),numerotransacao = COALESCE($10, numerotransacao),statusgrupoid = COALESCE($11, statusgrupoid),valor = COALESCE($12, valor),linhadigitavel = COALESCE($13, linhadigitavel),codigobarras = COALESCE($14, codigobarras),taxaboleto = COALESCE($15, taxaboleto),nossonumero = COALESCE($16, nossonumero),seqboleto = COALESCE($17, seqboleto),statusarquivo = COALESCE($18, statusarquivo),cobranca_cancelada = COALESCE($19, cobranca_cancelada),valor_bruto = COALESCE($20, valor_bruto),pcl_in_cobranca = COALESCE($21, pcl_in_cobranca) WHERE id = $22 RETURNING *',
        [
          tituloid,
          pessoausuarioid,
          tipodocumentoid,
          numerodocumento,
          taxajuro,
          taxamora,
          numero,
          datavencimento,
          datacadastramento,
          numerotransacao,
          statusgrupoid,
          valor,
          linhadigitavel,
          codigobarras,
          taxaboleto,
          nossonumero,
          seqboleto,
          statusarquivo,
          cobranca_cancelada,
          valor_bruto,
          pcl_in_cobranca,
          id,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      console.log(err);
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
      tituloid = null,
      pessoausuarioid = null,
      tipodocumentoid = null,
      numerodocumento = null,
      taxajuro = null,
      taxamora = null,
      numero = null,
      datavencimento = null,
      datacadastramento = null,
      numerotransacao = null,
      statusgrupoid = null,
      valor = null,
      linhadigitavel = null,
      codigobarras = null,
      taxaboleto = null,
      nossonumero = null,
      seqboleto = null,
      statusarquivo = null,
      cobranca_cancelada = null,
      valor_bruto = null,
      pcl_in_cobranca = null,
    } = data;

    try {
      const {
        rows,
      } = this.pool.query(
        'INSERT INTO parcela (titulo_id, pessoausuarioid, tipodocumentoid, numerodocumento, taxajuro, taxamora, numero, datavencimento, datacadastramento, numerotransacao, statusgrupoid, valor, linhadigitavel, codigobarras, taxaboleto, nossonumero, seqboleto, statusarquivo, cobranca_cancelada, valor_bruto, pcl_in_cobranca) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *',
        [
          tituloid,
          pessoausuarioid,
          tipodocumentoid,
          numerodocumento,
          taxajuro,
          taxamora,
          numero,
          datavencimento,
          datacadastramento,
          numerotransacao,
          statusgrupoid,
          valor,
          linhadigitavel,
          codigobarras,
          taxaboleto,
          nossonumero,
          seqboleto,
          statusarquivo,
          cobranca_cancelada,
          valor_bruto,
          pcl_in_cobranca,
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

  async invoice(data) {
    const {
      id,
      idLotePagamento,
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
      nome_emitente,
      centrocustoid,
      obs,
      numeroboleto,
      codigosegurancacartao,
      contacheque,
      fop_in_conciliado = true,
      fop_in_pre_conciliacao = false,
      che_id_cheque,
    } = data;

    try {
      await this.pool.query('BEGIN');
      const parcela = this.findPK(id);

      /**
       * Cria a forma de pagamento
       */
      const {
        rows: createFormaPagamento,
      } = await this.pool.query(
        'INSERT INTO formapagamento (parcelaid, agenciaid, contaid, numerocheque, numerocartao, numerodocumento, numeromatricula, numerotransacao, validadecartao, tipodecarteiraid, numeroempresa, tipocartaoid, obs, numeroboleto, codigosegurancacartao, valor, centrocustoid, nome_emitente, contacheque, fop_in_conciliado, fop_in_pre_conciliacao, che_id_cheque) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *',
        [
          id,
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
          parcela.valor,
          centrocustoid,
          nome_emitente,
          contacheque,
          fop_in_conciliado,
          fop_in_pre_conciliacao,
          che_id_cheque,
        ]
      );

      /**
       * Cria Parcela Lote
       */
      const {
        rows: createParcelaLote,
      } = await this.pool.query(
        'INSERT INTO parcelalote (parcelaid, pal_id_lote_pagamento, pal_dt_pagamento) VALUES ($1, $2, $3) RETURNING *',
        [id, idLotePagamento, new Date()]
      );

      /**
       * Atualiza status da Parcela
       */
      const {
        rows: updateParcela,
      } = await this.pool.query(
        'UPDATE parcela SET statusgrupoid = 2 WHERE id = $1',
        [id]
      );
      await this.pool.query('COMMIT');

      return parcela;
    } catch (err) {
      await this.pool.query('ROLLBACK');
      throw err;
    }
  }
}
