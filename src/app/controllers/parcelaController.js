/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as Yup from 'yup';
import LotePagamento from '../models/LotePagamento';
import TipoCarteira from '../models/TipoCarteira';
import Parcela from '../models/Parcela';
import ParcelaSeq from '../models/Sequelize/Parcela';

class ParcelaController {
  async index(req, res) {
    // const parcelas = await req.pool.query(query);

    // const querier = new ParcelaQuerier(req.query, req.knex('parcela'));
    // const parcelas = await querier.run();
    const { limit, page, perPage } = req.query;

    const parcelas = await new Parcela(req.pool).newGet(
      req.parsedQuery.query,
      req.parsedQuery.values,
      { limit, page, perPage }
    );

    res.json({ error: null, data: parcelas });
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
    });

    if (!(await schema.isValid(req.params))) {
      try {
        await schema.validate(req.params);
      } catch (error) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: error.errors },
        });
      }
    }

    const { id } = req.params;

    const response = await new Parcela(req.pool).findPK(id);

    if (response && response.error) {
      return res.status(response.error).json(response);
    }
    console.log(response);
    return res.json({ error: null, data: response });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      tituloid: Yup.number().integer(),
      pessoausuarioid: Yup.number().integer(),
      tipodocumentoid: Yup.number().integer(),
      numerodocumento: Yup.number().integer(),
      taxajuro: Yup.number(),
      taxamora: Yup.number(),
      numero: Yup.number(),
      datavencimento: Yup.date(),
      datacadastramento: Yup.date(),
      numerotransacao: Yup.number(),
      statusgrupoid: Yup.number().integer(),
      valor: Yup.number(),
      linhadigitavel: Yup.string(),
      codigobarras: Yup.string(),
      taxaboleto: Yup.number(),
      nossonumero: Yup.string(),
      seqboleto: Yup.number().integer(),
      statusarquivo: Yup.boolean(),
      cobranca_cancelada: Yup.string(),
      valor_bruto: Yup.number(),
      pcl_in_cobranca: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: error.errors },
        });
      }
    }

    const {
      body: {
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
      },
      params: { id },
    } = req;

    const data = {
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
    };

    const response = await new Parcela(req.pool).update(data);

    if (response && response.error) {
      return res.status(response.error).json(response);
    }

    return res.json({ error: null, data: response });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      tituloid: Yup.number().required(),
      pessoausuarioid: Yup.number().required(),
      tipodocumentoid: Yup.number().required(),
      numerodocumento: Yup.number(),
      taxajuro: Yup.number(),
      taxamora: Yup.number(),
      numero: Yup.number(),
      datavencimento: Yup.date().required(),
      datacadastramento: Yup.date(),
      numerotransacao: Yup.string(),
      statusgrupoid: Yup.number(),
      valor: Yup.number().required(),
      linhadigitavel: Yup.string(),
      codigobarras: Yup.string(),
      taxaboleto: Yup.number(),
      nossonumero: Yup.string(),
      seqboleto: Yup.number(),
      statusarquivo: Yup.number().integer(),
      cobranca_cancelada: Yup.boolean(),
      valor_bruto: Yup.number(),
      pcl_in_cobranca: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: error.errors },
        });
      }
    }

    const {
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
    } = req.body;

    const data = {
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
    };

    const response = await new Parcela(req.pool).create(data);

    if (response && response.error) {
      return res.status(response.error).json(response);
    }

    return res.json({ error: null, data: response });
  }

  async filterParecelas(req, res) {
    try {
      const {
        query: { limit },
      } = req;

      const parcelas = await new Parcela(req.pool).filterParcelas(limit);

      if (parcelas && parcelas.error) {
        return res.status(parcelas.error).json(parcelas);
      }

      return res.json({ error: null, data: parcelas });
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }
  }

  async pause(req, res) {
    try {
      const { id } = req.params;

      const parcela = await ParcelaSeq.update(
        { paused_at: new Date(), pcl_in_pause: true },
        { where: { id }, returning: true }
      );

      return res.json({ error: null, data: parcela });
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }
  }

  async start(req, res) {
    try {
      const { id } = req.params;

      const parcela = await ParcelaSeq.update(
        { paused_at: null, pcl_in_pause: false },
        { where: { id }, returning: true }
      );

      return res.json({ error: null, data: parcela });
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }
  }

  async addCobranca(req, res) {
    try {
      const { id } = req.params;

      const parcela = await ParcelaSeq.update(
        { pcl_in_cobranca: true },
        { where: { id }, returning: true }
      );

      return res.json({ error: null, data: parcela });
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }
  }

  async remCobranca(req, res) {
    try {
      const { id } = req.params;

      const parcela = await ParcelaSeq.update(
        { pcl_in_cobranca: false },
        { where: { id }, returning: true }
      );

      return res.json({ error: null, data: parcela });
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }
  }

  async baixaParcela(req, res) {
    const schema = Yup.object().shape({
      pessoausuarioid: Yup.number().integer(),
      lop_id_pessoa: Yup.number().integer(),
      lote_id: Yup.number().integer(),
      lop_id_tipo_baixa: Yup.number().integer().required(),
      lop_in_tipo_movimento: Yup.string().required(),
      modPagamento: Yup.number().integer().required(),
      agenciaid: Yup.number().integer(),
      contaid: Yup.number().integer(),
      numerocheque: Yup.string().when('modPagamento', (modPagamento, field) =>
        modPagamento === 1 ? field.required() : field
      ),
      numerocartao: Yup.string().when('modPagamento', (modPagamento, field) =>
        modPagamento === 2 || modPagamento === 34 ? field.required() : field
      ),
      numerodocumento: Yup.string().when(
        'modPagamento',
        (modPagamento, field) =>
          modPagamento === 10 ? field.required() : field
      ),
      numeromatricula: Yup.string().when(
        'modPagamento',
        (modPagamento, field) =>
          modPagamento === 10 ? field.required() : field
      ),
      numerotransacao: Yup.string(),
      validadecartao: Yup.date().when('modPagamento', (modPagamento, field) =>
        modPagamento === 2 || modPagamento === 34 ? field.required() : field
      ),
      tipodecarteiraid: Yup.number().integer().required(),
      numeroempresa: Yup.string(),
      tipocartaoid: Yup.number().integer(),
      obs: Yup.string(),
      numeroboleto: Yup.string().when('modPagamento', (modPagamento, field) =>
        modPagamento === 7 ? field.required() : field
      ),
      codigosegurancacartao: Yup.number()
        .integer()
        .when('modPagamento', (modPagamento, field) =>
          modPagamento === 2 || modPagamento === 34 ? field.required() : field
        ),
      paymentid: Yup.string()
        .when('modPagamento', (modPagamento, field) =>
          modPagamento === 2 || modPagamento === 34 ? field.required() : field
        )
        .when('lop_id_tipo_baixa', (tipoBaixa, field) =>
          parseInt(tipoBaixa, 10) === 4 ? field.required : field
        ),
      tid: Yup.string()
        .when('modPagamento', (modPagamento, field) =>
          modPagamento === 2 || modPagamento === 34 ? field.required() : field
        )
        .when('lop_id_tipo_baixa', (tipoBaixa, field) =>
          parseInt(tipoBaixa, 10) === 4 ? field.required : field
        ),
    });

    const carteira = await new TipoCarteira(req.pool).findPK(
      req.body.tipodecarteiraid
    );

    const modPagamento = carteira
      ? parseInt(carteira.modalidadepagamentoid, 10)
      : null;

    console.log(carteira.modalidadepagamentoid);

    if (
      !(await schema.isValid({
        ...req.body,
        modPagamento,
      }))
    ) {
      try {
        await schema.validate({
          ...req.body,
          modPagamento,
        });
      } catch (error) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: error.errors },
        });
      }
    }

    const {
      lop_id_pessoa = 1,
      lop_id_tipo_baixa = 4,
      lop_in_tipo_movimento = 'C',
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
      fop_in_conciliado,
      fop_in_pre_conciliacao,
      che_id_cheque,
      lote_id,
      paymentid,
      tid,
    } = req.body;

    const { id } = req.params;

    const parcela = await new Parcela(req.pool).findPK(id);
    let lotePagamento;

    if ((parcela && parseInt(parcela.statusgrupoid, 10) === 2) || !parcela) {
      return res.json({
        error: 401,
        data: {
          message:
            'Portion cannot be invoiced because it has already been invoiced',
        },
      });
    }

    /**
     * Criando lote para efetuar a baixa
     */
    if (lote_id) {
      lotePagamento = await new LotePagamento(req.pool).findPK(lote_id);
    }

    if (
      !lote_id ||
      !lotePagamento ||
      (lotePagamento && parseInt(lotePagamento.statusid, 10) !== 1) ||
      lotePagamento.error
    ) {
      lotePagamento = await new LotePagamento(req.pool).create({
        statusid: 1,
        datacadastro: new Date(),
        pessoausuarioid: 1,
        lop_id_pessoa,
        lop_id_tipo_baixa,
        lop_in_tipo_movimento,
        lop_in_cobranca: false,
      });
    }

    const dataInvoice = {
      id,
      idLotePagamento: lotePagamento.id,
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
      fop_in_conciliado,
      fop_in_pre_conciliacao,
      che_id_cheque,
      paymentid,
      tid,
    };

    try {
      await new Parcela(req.pool).invoice(dataInvoice);
    } catch (err) {
      return res.status(400).json({
        error: 400,
        data: { error: 'Internal Server Error', message: err.message },
      });
    }

    /**
     * Baixa Lote
     */
    await new LotePagamento(req.pool).update({
      id: lotePagamento.id,
      statusid: 2,
      lop_dt_baixa: new Date(),
    });

    return res.json({ error: null, data: lotePagamento });
  }

  async baixaParcelas(req, res) {
    const schema = Yup.object().shape({
      parcelas: Yup.array().of(
        Yup.object().shape({
          id: Yup.number().integer().required(),
          modPagamento: Yup.number().integer().required(),
          numerocartao: Yup.string().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 2 || modPagamento === 34
                ? field.required()
                : field
          ),

          numerocheque: Yup.string().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 1 ? field.required() : field
          ),
          numerodocumento: Yup.string().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 10 ? field.required() : field
          ),
          numeromatricula: Yup.string().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 10 ? field.required() : field
          ),
          validadecartao: Yup.date().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 2 || modPagamento === 34
                ? field.required()
                : field
          ),
          numerotransacao: Yup.string(),
          numeroboleto: Yup.string().when(
            'modPagamento',
            (modPagamento, field) =>
              modPagamento === 7 ? field.required() : field
          ),
          codigosegurancacartao: Yup.number()
            .integer()
            .when('modPagamento', (modPagamento, field) =>
              modPagamento === 2 || modPagamento === 34
                ? field.required()
                : field
            ),
          obs: Yup.string(),
          numeroempresa: Yup.string(),
          tipodecarteiraid: Yup.number().integer().required(),
          tipocartaoid: Yup.number().integer(),
          contaid: Yup.number().integer(),
          agenciaid: Yup.number().integer(),
          paymentid: Yup.string()
            .when('modPagamento', (modPagamento, field) =>
              modPagamento === 2 || modPagamento === 34
                ? field.required()
                : field
            )
            .when('lop_id_tipo_baixa', (tipoBaixa, field) =>
              parseInt(tipoBaixa, 10) === 4 ? field.required : field
            ),
          tid: Yup.string()
            .when('modPagamento', (modPagamento, field) =>
              modPagamento === 2 || modPagamento === 34
                ? field.required()
                : field
            )
            .when('lop_id_tipo_baixa', (tipoBaixa, field) =>
              parseInt(tipoBaixa, 10) === 4 ? field.required : field
            ),
        })
      ),
      pessoausuarioid: Yup.number().integer(),
      lop_id_pessoa: Yup.number().integer(),
      lote_id: Yup.number().integer(),
      lop_id_tipo_baixa: Yup.number().integer().required(),
      lop_in_tipo_movimento: Yup.string().required(),
    });

    if (!req.body.parcelas) {
      return res.status(401).json({
        error: 401,
        data: { message: 'Validation fails', errors: 'parcelas' },
      });
    }

    req.body.parcelas = await Promise.all(
      req.body.parcelas.map(async (p) => {
        const carteira = await new TipoCarteira(req.pool).findPK(
          p.tipodecarteiraid
        );
        const modPagamento = carteira
          ? parseInt(carteira.modalidadepagamentoid, 10)
          : null;
        return { ...p, modPagamento };
      })
    );

    if (
      !(await schema.isValid({
        ...req.body,
      }))
    ) {
      try {
        await schema.validate({
          ...req.body,
        });
      } catch (error) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: error.errors },
        });
      }
    }

    const {
      parcelas,
      lop_id_pessoa = 1,
      lop_id_tipo_baixa = 4,
      lop_in_tipo_movimento = 'C',
      lote_id,
    } = req.body;

    let lotePagamento;
    /**
     * Criando lote para efetuar a baixa
     */
    if (lote_id) {
      lotePagamento = await new LotePagamento(req.pool).findPK(lote_id);
    }

    if (
      !lote_id ||
      !lotePagamento ||
      (lotePagamento && parseInt(lotePagamento.statusid, 10) !== 1) ||
      lotePagamento.error
    ) {
      console.log('Entrei aqui');
      lotePagamento = await new LotePagamento(req.pool).create({
        statusid: 1,
        datacadastro: new Date(),
        pessoausuarioid: 1,
        lop_id_pessoa,
        lop_id_tipo_baixa,
        lop_in_tipo_movimento,
        lop_in_cobranca: false,
      });
    }
    const parcelaErr = [];

    req.pool.query('BEGIN');

    let dataInvoice = {
      idLotePagamento: lotePagamento.id,
    };

    for (const p of parcelas) {
      try {
        const parcela = await new Parcela(req.pool).findPK(p.id);

        if (parseInt(parcela.statusgrupoid, 10) === 2) {
          parcelaErr.push({
            id: p.id,
            error:
              'Portion cannot be invoiced because it has already been invoiced',
          });
          continue;
        }

        dataInvoice = {
          ...dataInvoice,
          agenciaid: p.agenciaid,
          contaid: p.contaid,
          numerocheque: p.numerocheque,
          numerocartao: p.numerocartao,
          numerodocumento: p.numerodocumento,
          numeromatricula: p.numeromatricula,
          numerotransacao: p.numerotransacao,
          validadecartao: p.validadecartao,
          tipodecarteiraid: p.tipodecarteiraid,
          numeroempresa: p.numeroempresa,
          tipocartaoid: p.tipocartaoid,
          nome_emitente: p.nome_emitente,
          centrocustoid: p.centrocustoid,
          obs: p.obs,
          numeroboleto: p.numeroboleto,
          codigosegurancacartao: p.codigosegurancacartao,
          contacheque: p.contacheque,
          fop_in_conciliado: p.fop_in_conciliado,
          fop_in_pre_conciliacao: p.fop_in_pre_conciliacao,
          che_id_cheque: p.che_id_cheque,
          paymentid: p.paymentid,
          tid: p.tid,
        };

        await new Parcela(req.pool).invoice({ ...dataInvoice, id: p.id });
      } catch (err) {
        req.pool.query('ROLLBACK');
        console.log(err);
        return res.status(400).json({
          error: 400,
          data: { error: 'Internal Server Error', message: err.message },
        });
      }
    }

    if (parcelaErr.length === parcelas.length) {
      return res.status(400).json({ error: 400, message: parcelaErr });
    }

    await new LotePagamento(req.pool).update({
      id: lotePagamento.id,
      statusid: 2,
      lop_dt_baixa: new Date(),
    });
    req.pool.query('COMMIT');

    return res.json({ error: null, data: lotePagamento });
  }
}

export default new ParcelaController();
