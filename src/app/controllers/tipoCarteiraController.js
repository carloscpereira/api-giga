import queryStringConverter from 'sequelize-querystring-converter';

import TipoCarteira from '../models/Sequelize/TipoCarteira';
import ModalidadeCobranca from '../models/Sequelize/ModalidadeCobranca';
import ModalidadePagamento from '../models/Sequelize/ModalidadePagamento';

class TipoCarteiraController {
  async index(req, res) {
    const { page = 1, limit = 30, with: withColumn, filter = {} } = req.query;

    const columns = withColumn ? withColumn.split(',') : [];

    const { carteira = {}, modalidade_cobranca = {}, modalidade_pagamento = {} } = filter;

    const criteriaCarteira = queryStringConverter.convert({ query: carteira });
    const criteriaModalidadeCobranca = queryStringConverter.convert({ query: modalidade_cobranca });
    const criteriaModalidadePagamento = queryStringConverter.convert({ query: modalidade_pagamento });

    console.log(criteriaCarteira);

    const tipoCarteira = await TipoCarteira.findAll({
      limit,
      offset: (page - 1) * limit,
      ...criteriaCarteira,
      attributes: { exclude: ['img_doc_cobranca'] },
      include: [
        ...(columns.includes('modalidade_cobranca')
          ? [{ model: ModalidadeCobranca, as: 'modalidade_cobranca', ...criteriaModalidadeCobranca }]
          : []),
        ...(columns.includes('modalidade_pagamento')
          ? [{ model: ModalidadePagamento, as: 'modalidade_pagamento', ...criteriaModalidadePagamento }]
          : []),
      ],
    });
    return res.json({ error: null, data: tipoCarteira });
  }

  async show(req, res) {
    const { id } = req.params;

    const tipoCarteira = await TipoCarteira.findByPk(id);

    return res.json({ error: null, data: tipoCarteira });
  }

  async update(req, res) {
    const {
      body: {
        descricao = null,
        modalidadepagamentoid = null,
        bancoid = null,
        tipocartaoid = null,
        carteira = null,
        modpagantigo = null,
        transferenciaoutrobanco = null,
        boletocomregistro = null,
        adicionalcomissao = null,
        cod_remessa = null,
        cod_cancelamento = null,
        img_doc_cobranca = null,
        deposito_identificado = null,
        diafechamentoconsignataria = null,
        tdc_in_documento_cobranca = null,
        tdc_in_bloqueio_cadastro = null,
        nu_prazo_inadimplencia_cobranca = null,
        nu_prazo_tolerancia_autorizacao = null,
        nu_prazo_bloqueio_contrato = null,
      },
      params: { id },
    } = req;

    const data = {
      ...(descricao ? { descricao } : {}),
      ...(modalidadepagamentoid ? { modalidadepagamentoid } : {}),
      ...(bancoid ? { bancoid } : {}),
      ...(tipocartaoid ? { tipocartaoid } : {}),
      ...(carteira ? { carteira } : {}),
      ...(modpagantigo ? { modpagantigo } : {}),
      ...(transferenciaoutrobanco ? { transferenciaoutrobanco } : {}),
      ...(boletocomregistro ? { boletocomregistro } : {}),
      ...(adicionalcomissao ? { adicionalcomissao } : {}),
      ...(cod_remessa ? { cod_remessa } : {}),
      ...(cod_cancelamento ? { cod_cancelamento } : {}),
      ...(img_doc_cobranca ? { img_doc_cobranca } : {}),
      ...(deposito_identificado ? { deposito_identificado } : {}),
      ...(diafechamentoconsignataria ? { diafechamentoconsignataria } : {}),
      ...(tdc_in_documento_cobranca ? { tdc_in_documento_cobranca } : {}),
      ...(tdc_in_bloqueio_cadastro ? { tdc_in_bloqueio_cadastro } : {}),
      ...(nu_prazo_inadimplencia_cobranca ? { nu_prazo_inadimplencia_cobranca } : {}),
      ...(nu_prazo_tolerancia_autorizacao ? { nu_prazo_tolerancia_autorizacao } : {}),
      ...(nu_prazo_bloqueio_contrato ? { nu_prazo_bloqueio_contrato } : {}),
    };

    const tipoCarteira = await TipoCarteira.update(data, {
      where: {
        id,
      },
      returning: true,
    });

    return res.status(201).json({ error: null, data: tipoCarteira });
  }

  async store(req, res) {
    const {
      body: {
        descricao = null,
        modalidadepagamentoid = null,
        bancoid = null,
        tipocartaoid = null,
        carteira = null,
        modpagantigo = null,
        transferenciaoutrobanco = null,
        boletocomregistro = null,
        adicionalcomissao = null,
        cod_remessa = null,
        cod_cancelamento = null,
        img_doc_cobranca = null,
        deposito_identificado = null,
        diafechamentoconsignataria = null,
        tdc_in_documento_cobranca = null,
        tdc_in_bloqueio_cadastro = null,
        nu_prazo_inadimplencia_cobranca = null,
        nu_prazo_tolerancia_autorizacao = null,
        nu_prazo_bloqueio_contrato = null,
      },
    } = req;

    const data = {
      descricao,
      modalidadepagamentoid,
      bancoid,
      tipocartaoid,
      carteira,
      modpagantigo,
      transferenciaoutrobanco,
      boletocomregistro,
      adicionalcomissao,
      cod_remessa,
      cod_cancelamento,
      img_doc_cobranca,
      deposito_identificado,
      diafechamentoconsignataria,
      tdc_in_documento_cobranca,
      tdc_in_bloqueio_cadastro,
      nu_prazo_inadimplencia_cobranca,
      nu_prazo_tolerancia_autorizacao,
      nu_prazo_bloqueio_contrato,
    };

    const tipoCarteira = await TipoCarteira.create(data);

    return res.status(201).json({ error: null, data: tipoCarteira });
  }
}

export default new TipoCarteiraController();
