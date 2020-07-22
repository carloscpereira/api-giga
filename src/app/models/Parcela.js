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

  async newGet(q, params, { limit = 20 }) {
    try {
      let query = `
      SELECT * FROM
      (SELECT

        -- Referentes a parcela
        parcela.id as parcela_id,
        parcela.statusgrupoid as parcela_statusid,
        statusgrupo.descricao as parcela_status,
        parcela.valor as parcela_valor,
        parcela.valor_bruto as parcela_valor_bruto,
        parcela.numero as parcela_numero,
        parcela.datavencimento as parcela_vencimento,
        parcelalote.pal_dt_pagamento as parcela_pagamento,
        parcela.datacadastramento as parcela_cadastro,
        parcela.pcl_in_cobranca as parcela_in_cobranca,

        -- Referentes ao Lote
        lotepagamento.id as lote_id,
        lotepagamento.datacadastro as lote_cadastro,
        lotepagamento.lop_dt_baixa as lote_baixa,

        -- Referentes ao Titulo
        titulo.id as titulo_id,
        titulo.valor as titulo_valor,
        titulo.numerototalparcelas as titulo_parcelas,
        titulo.statusid as titulo_statusid,

        -- Referentes a Carteira
        cn_tipodecarteira.id as carteira_id,
        cn_tipodecarteira.descricao as carteira_tipo,
        cn_tipodecarteira.modalidadepagamentoid as carteira_modalidadeid,
        modpagamento.descricao AS carteira_modalidade,

        -- Referentes a Boleto
        parcela.linhadigitavel as boleto_linhadigitavel,
        parcela.codigobarras as boleto_codigobarras,
        parcela.nossonumero as boleto_nossonumero,
        parcela.taxaboleto as boleto_taxaboleto,
        parcela.taxamora as boleto_taxamora,

        -- Referentes ao Pagante
        sp_dadospessoafisica.id as rf_id,
        sp_dadospessoafisica.nome as rf_nome,
        sp_dadospessoafisica.rg as rf_rg,
        sp_dadospessoafisica.cpf as rf_cpf,
        sp_dadospessoafisica.datanascimento as rf_nascimento,

        -- Referentes ao Email Pagante
        sp_email.descricao as rf_email,

        -- Refetentes ao Telefone Pagante
        sp_telefone.numero as rf_numero,

        -- Referente ao Cartão de Créditos
        cartao.id as cartao_id,
        cartao.numerocartao as cartao_numero,
        cartao.codigosegurancacartao as cartao_codigoseguranca,
        cartao.validadecartao as cartao_validade,
        cartao.diadevencimento as cartao_diavencimento,
        cartao.nome_titular as cartao_titular,
        cartao.tipocartaoid as cartao_tipoid,
        c_tipo.descricao as cartao_tipo,

        -- Referente ao Contrato
        cn_contrato.id as contrato_id,
        cn_contrato.numerocontrato as contrato_numero,
        cn_contrato.statusid as contrato_statusid,
        cn_contrato.dataadesao as contrato_adesao,
        cn_contrato.datacancelamento as contrato_cancelamento,

        -- Forma Pagamento
        formapagamento.valor as formapamento_valor,

        -- Cheque
        formapagamento.numerocheque as formapamento_cheque,
        formapagamento.contacheque as formapagamento_cheque_conta,
        formapagamento.nome_emitente as formapagamento_cheque_emitente,
        -- Cartão
        formapagamento.numerocartao as formapagamento_catao_numero,
        formapagamento.validadecartao as formapagamento_cartao_validade,
        formapagamento.codigosegurancacartao as formapagamento_cartao_codigoseguranca,
        formapagamento.tid as formapagamento_cartao_tid,
        formapagamento.paymentid as formapagamento_cartao_paymentid,
        -- Consignado
        formapagamento.numerodocumento as formapagamento_documento,
        formapagamento.numeromatricula as formapagamento_matricula,
        -- Transferencia
        formapagamento.numerotransacao as formapagamento_transacao,
        -- Boleto
        formapagamento.numeroboleto as formapagamento_boleto,
        -- Carteira
        formapagamento.tipodecarteiraid as formapagamento_carteiraid,
        formapagamento.agenciaid as formapagamento_agenciaid,
        fp_agencia.descricao as formapagamento_agencia,
        fp_agencia.codigo as formapagamento_agencia_codigo,
        fpa_banco.descricao as formapagamento_banco,
        fpa_banco.codigo as formapagamento_banco_codigo,
        fp_conta.numero as formapagamento_conta


        FROM parcela
        INNER JOIN statusgrupo ON (parcela.statusgrupoid = statusgrupo.id)
        INNER JOIN titulo ON (parcela.tituloid = titulo.id)
        INNER JOIN cn_tipodecarteira ON (titulo.tipodecarteiraid = cn_tipodecarteira.id)
        INNER JOIN cn_contrato ON (titulo.numerocontratoid = cn_contrato.id)
        INNER JOIN cn_associadopf ON (cn_contrato.id = cn_associadopf.id)
        INNER JOIN sp_dadospessoafisica ON (cn_associadopf.responsavelfinanceiroid = sp_dadospessoafisica.id)
        INNER JOIN cartao ON (sp_dadospessoafisica.id = cartao.pessoaid AND cartao.car_in_principal)
        LEFT JOIN sp_email ON (sp_dadospessoafisica.id = sp_email.dadosid AND sp_email.ema_in_principal = true)
        LEFT JOIN sp_telefone ON (sp_dadospessoafisica.id = sp_telefone.dadosid AND sp_telefone.tel_in_principal = true)
        LEFT JOIN modpagamento ON (cn_tipodecarteira.modalidadepagamentoid = modpagamento.id)
        LEFT JOIN formapagamento ON (parcela.id = formapagamento.parcelaid)
        LEFT JOIN agencia fp_agencia ON (formapagamento.agenciaid = fp_agencia.id)
        LEFT JOIN banco fpa_banco ON (fp_agencia.bancoid = fpa_banco.id)
        LEFT JOIN conta fp_conta ON (formapagamento.contaid = fp_conta.id)
        LEFT JOIN parcelalote ON (parcela.id = parcelalote.parcelaid)
        LEFT JOIN tipocartao c_tipo ON (cartao.tipocartaoid = c_tipo.id)
        LEFT JOIN lotepagamento ON (parcelalote.pal_id_lote_pagamento = lotepagamento.id)) AS p
      `;

      if (!!q && !!params) {
        query += ` WHERE ${q}`;
      }

      query += ` LIMIT ${limit}`;

      // console.log(query);

      const { rows } = await this.pool.query(query, params);

      return rows;
    } catch (err) {
      console.log(err);
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
