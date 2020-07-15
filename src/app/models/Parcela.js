/* eslint-disable no-unused-vars */
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
      paymentid,
      tid,
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
        'INSERT INTO formapagamento (parcelaid, agenciaid, contaid, numerocheque, numerocartao, numerodocumento, numeromatricula, numerotransacao, validadecartao, tipodecarteiraid, numeroempresa, tipocartaoid, obs, numeroboleto, codigosegurancacartao, valor, centrocustoid, nome_emitente, contacheque, fop_in_conciliado, fop_in_pre_conciliacao, che_id_cheque, paymentid, tid,) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *',
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
          paymentid,
          tid,
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

  async filterParcelas(limit) {
    try {
      const { rows } = await this.pool.query(
        `
      SELECT
        parcela.id AS parcela_id,
        parcela.valor AS parcela_valor,
        parcela.statusgrupoid AS parcela_status,
        parcela.numero AS parcela_numero,
        cn_tipodecarteira.modalidadepagamentoid AS modalidade_pagamento,
        cn_tipodecarteira.id AS tipo_pagamento,
        titulo.id AS titulo_id,
        sp_dadospessoafisica.id AS pessoa_id,
        sp_dadospessoafisica.nome AS pessoa_nome,
        cn_contrato.id AS contrato_id,
        cartao.id AS cartao_id,
        cartao.numerocartao AS numero_cartao,
        cartao.codigosegurancacartao AS codigo_seguranca_cartao,
        cartao.validadecartao AS validade_cartao,
        cartao.diadevencimento AS dia_vencimento_cartao,
        cartao.nome_titular
        FROM parcela
        INNER JOIN titulo ON (parcela.tituloid = titulo.id)
        INNER JOIN cn_tipodecarteira ON (titulo.tipodecarteiraid = cn_tipodecarteira.id)
        INNER JOIN cn_contrato ON (titulo.numerocontratoid = cn_contrato.id)
        INNER JOIN cn_associadopf ON (cn_contrato.id = cn_associadopf.id)
        INNER JOIN sp_dadospessoafisica ON (cn_associadopf.responsavelfinanceiroid = sp_dadospessoafisica.id)
        RIGHT JOIN cartao ON (sp_dadospessoafisica.id = cartao.pessoaid)
        WHERE (parcela.datavencimento BETWEEN current_date - 3 AND current_date)
        AND (parcela.statusgrupoid = 1)
        AND (cn_tipodecarteira.modalidadepagamentoid = 2 OR (titulo.modpagamentoid IS NOT NULL AND (titulo.modpagamentoid = 2 AND titulo.modpagamentoid = 34)))
        AND (cn_contrato.tipocontratoid = 5 AND cn_contrato.statusid = 8)
        AND (cartao.car_in_principal = true AND cartao.validadecartao > current_date)
        AND NOT parcela.pcl_in_cobranca
        LIMIT $1
      `,
        [limit]
      );

      if (!rows.length) return [];

      return rows;
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
