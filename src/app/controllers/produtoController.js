/* eslint-disable no-restricted-syntax */
import queryStringConverter from 'sequelize-querystring-converter';

import Produto from '../models/Sequelize/Produto';
import VersaoPlano from '../models/Sequelize/VersaoPlano';
import Plano from '../models/Sequelize/Plano';
import SegmentacaoAssistencial from '../models/Sequelize/SegmentacaoAssistencial';
import ParticipacaoFinanceira from '../models/Sequelize/ParticipacaoFinanceira';
import TipoContratacao from '../models/Sequelize/TipoContratacao';
import TipoAreaAbrangencia from '../models/Sequelize/TipoAreaAbrangencia';
import AreaCobertura from '../models/Sequelize/AreaCobertura';
import TipoContrato from '../models/Sequelize/TipoContrato';
import RegraVigenciaContrato from '../models/Sequelize/RegraVigenciaContrato';
import RolCoberturaPlano from '../models/Sequelize/RolCoberturaPlano';
import Procedimento from '../models/Sequelize/Procedimento';
import Especialidade from '../models/Sequelize/Especialidade';

class ProdutoController {
  async index(req, res) {
    const {
      query: { page = 1, limit = 20, ...query },
      sequelize,
    } = req;

    const fields = Object.keys(query);
    const value = Object.values(query);

    let querySql = `select distinct "cn_produto".*,
    coalesce("cn_planotipobeneficiario".valor, 0) as "preco",
    "cn_plano".descricao                          as "plano",
    "cn_versaoplano".descricao                    as "versaoplano"
from "cn_produto"
inner join "cn_rolcoberturaplano" on "cn_rolcoberturaplano"."planoid" = "cn_produto"."planoid" and
                                  "cn_rolcoberturaplano"."versaoid" = "cn_produto"."versaoid"
inner join "cn_tabelaprecoplano" on "cn_tabelaprecoplano".planoid = "cn_produto".planoid and
                                 "cn_tabelaprecoplano".versaoid = "cn_produto".versaoid
inner join "cn_plano" on "cn_produto".planoid = "cn_plano".id
inner join "cn_versaoplano" on "cn_produto".versaoid = "cn_versaoplano".id
left join "cn_planotipobeneficiario"
       on "cn_planotipobeneficiario"."tabelaprecoplanoid" = "cn_tabelaprecoplano"."id" and
          "cn_planotipobeneficiario"."tipobeneficiarioid" = 1`;

    let andWhere = '';

    for (const [i, v] of fields.entries()) {
      if (i === 0) {
        andWhere = `WHERE "cn_produto".${v} = $${i + 1}`;
        // eslint-disable-next-line no-continue
        continue;
      }
      andWhere = `${andWhere} AND "cn_produto".${v} = $${i + 1}`;
    }

    if (andWhere) {
      querySql = `${querySql} ${andWhere}`;
    }

    console.log(querySql);

    const [produtos] = await sequelize.query(querySql, { bind: value });

    return res.json({ error: null, data: produtos });
  }

  async show(req, res) {
    const { id } = req.params;

    const produto = await Produto.findByPk(id, {
      attributes: {
        exclude: [
          'planoid',
          'versaoid',
          'segmentacaoassistencialid',
          'participacaofinanceiraid',
          'tipocontratacaoid',
          'tipoareaabrangenciaid',
          'areacoberturaid',
          'pro_id_tipo_contrato',
          'pro_id_regra_vigencia',
        ],
      },
      include: [
        { model: Plano, as: 'plano', attributes: ['id', 'descricao'] },
        { model: VersaoPlano, as: 'versao_plano', attributes: ['id', 'descricao'] },
        { model: SegmentacaoAssistencial, as: 'segmentacao_assistencial', attributes: ['id', 'descricao'] },
        { model: ParticipacaoFinanceira, as: 'participacao_financeira', attributes: ['id', 'descricao'] },
        { model: TipoContratacao, as: 'tipo_contratacao', attributes: ['id', 'descricao'] },
        { model: TipoAreaAbrangencia, as: 'tipo_area_abrangencia', attributes: ['id', 'descricao'] },
        { model: AreaCobertura, as: 'area_cobertura', attributes: ['id', 'descricao'] },
        { model: TipoContrato, as: 'tipo_contrato', attributes: ['id', 'descricao'] },
        { model: RegraVigenciaContrato, as: 'regra_vigencia' },
      ],
    });

    return res.json({ error: null, data: produto });
  }

  async create(req, res) {
    const {
      planoid = null,
      versaoid = null,
      segmentacaoassistencialid = null,
      participacaofinanceiraid = null,
      tipocontratacaoid = null,
      tipoareaabrangenciaid = null,
      areacoberturaid = null,
      limitediasbloqueio = null,
      registroans = null,
      codigo = null,
      limitemensalautorizacao = null,
      pro_nu_parcelas_financiadas = null,
      pro_id_tipo_contrato = null,
      pro_id_regra_vigencia = null,
      prd_in_bloqueado = null,
      prd_in_renovaauto = null,
      descricao = null,
    } = req.body;

    const verifyPlano = await Plano.findByPk(planoid);
    const verifyVersao = await VersaoPlano.findByPk(versaoid);
    const verifySegmentscaoAssistencial = await SegmentacaoAssistencial.findByPk(segmentacaoassistencialid);
    const verifyParticipacaoFinanceira = await ParticipacaoFinanceira.findByPk(participacaofinanceiraid);
    const verifyTipoContratacao = await TipoContratacao.findByPk(tipocontratacaoid);
    const verifyTipoAreaAbrangencia = await TipoAreaAbrangencia.findByPk(tipoareaabrangenciaid);
    const verifyAreaCobertura = await AreaCobertura.findByPk(areacoberturaid);
    const verifyVigencia = await RegraVigenciaContrato.findByPk(pro_id_regra_vigencia);
    const verifyTipoContrato = await TipoContrato.findByPk(pro_id_tipo_contrato);

    if (!verifyPlano) throw new Error('Não foi possível localizar o plano informado');
    if (!verifyVersao) throw new Error('Não foi possível localizar oa versão do plano informado');
    if (!verifySegmentscaoAssistencial) {
      throw new Error('Não foi possível localizar a segmentação assistencial informado');
    }
    if (!verifyParticipacaoFinanceira)
      throw new Error('Não foi possível localizar o participação financeira informado');
    if (!verifyTipoContratacao) throw new Error('Não foi possível localizar o tipo de contratação informado');
    if (!verifyTipoAreaAbrangencia) throw new Error('Não foi possível localizar o tipo de abrangencia informado');
    if (!verifyAreaCobertura) throw new Error('Não foi possível localizar a area de cobertura plano informado');
    if (!verifyVigencia) throw new Error('Não foi possível localizar a vigencia informado');
    if (!verifyTipoContrato) throw new Error('Não foi possível localizar o tipo de contrato informado');

    const data = {
      planoid,
      versaoid,
      segmentacaoassistencialid,
      participacaofinanceiraid,
      tipocontratacaoid,
      tipoareaabrangenciaid,
      areacoberturaid,
      limitediasbloqueio,
      registroans,
      codigo,
      limitemensalautorizacao,
      pro_nu_parcelas_financiadas,
      pro_id_tipo_contrato,
      pro_id_regra_vigencia,
      prd_in_bloqueado,
      prd_in_renovaauto,
      descricao,
    };

    const produto = await Produto.create(data);

    return res.json({ error: null, data: produto });
  }

  async update(req, res) {
    const {
      body: {
        planoid = null,
        versaoid = null,
        segmentacaoassistencialid = null,
        participacaofinanceiraid = null,
        tipocontratacaoid = null,
        tipoareaabrangenciaid = null,
        areacoberturaid = null,
        limitediasbloqueio = null,
        registroans = null,
        codigo = null,
        limitemensalautorizacao = null,
        pro_nu_parcelas_financiadas = null,
        pro_id_tipo_contrato = null,
        pro_id_regra_vigencia = null,
        prd_in_bloqueado = null,
        prd_in_renovaauto = null,
        descricao = null,
      },
      params: { id },
    } = req.body;

    const produto = await Produto.findByPk(id);

    const verifyPlano = planoid ? await Plano.findByPk(planoid) : null;
    const verifyVersao = versaoid ? await VersaoPlano.findByPk(versaoid) : null;
    const verifySegmentscaoAssistencial = segmentacaoassistencialid
      ? await SegmentacaoAssistencial.findByPk(segmentacaoassistencialid)
      : null;
    const verifyParticipacaoFinanceira = participacaofinanceiraid
      ? await ParticipacaoFinanceira.findByPk(participacaofinanceiraid)
      : null;
    const verifyTipoContratacao = tipocontratacaoid ? await TipoContratacao.findByPk(tipocontratacaoid) : null;
    const verifyTipoAreaAbrangencia = tipoareaabrangenciaid
      ? await TipoAreaAbrangencia.findByPk(tipoareaabrangenciaid)
      : null;
    const verifyAreaCobertura = areacoberturaid ? await AreaCobertura.findByPk(areacoberturaid) : null;
    const verifyVigencia = pro_id_regra_vigencia ? await RegraVigenciaContrato.findByPk(pro_id_regra_vigencia) : null;
    const verifyTipoContrato = pro_id_tipo_contrato ? await TipoContrato.findByPk(pro_id_tipo_contrato) : null;

    if (planoid && !verifyPlano) throw new Error('Não foi possível localizar o plano informado');
    if (versaoid && !verifyVersao) throw new Error('Não foi possível localizar oa versão do plano informado');
    if (segmentacaoassistencialid && !verifySegmentscaoAssistencial) {
      throw new Error('Não foi possível localizar a segmentação assistencial informado');
    }
    if (participacaofinanceiraid && !verifyParticipacaoFinanceira)
      throw new Error('Não foi possível localizar o participação financeira informado');
    if (tipocontratacaoid && !verifyTipoContratacao)
      throw new Error('Não foi possível localizar o tipo de contratação informado');
    if (tipoareaabrangenciaid && !verifyTipoAreaAbrangencia)
      throw new Error('Não foi possível localizar o tipo de abrangencia informado');
    if (areacoberturaid && !verifyAreaCobertura)
      throw new Error('Não foi possível localizar a area de cobertura plano informado');
    if (pro_id_regra_vigencia && !verifyVigencia) throw new Error('Não foi possível localizar a vigencia informado');
    if (pro_id_tipo_contrato && !verifyTipoContrato)
      throw new Error('Não foi possível localizar o tipo de contrato informado');

    if (!produto) throw new Error('Produto não informado');

    const data = {
      ...(planoid ? { planoid } : {}),
      ...(versaoid ? { versaoid } : {}),
      ...(segmentacaoassistencialid ? { segmentacaoassistencialid } : {}),
      ...(participacaofinanceiraid ? { participacaofinanceiraid } : {}),
      ...(tipocontratacaoid ? { tipocontratacaoid } : {}),
      ...(tipoareaabrangenciaid ? { tipoareaabrangenciaid } : {}),
      ...(areacoberturaid ? { areacoberturaid } : {}),
      ...(limitediasbloqueio ? { limitediasbloqueio } : {}),
      ...(registroans ? { registroans } : {}),
      ...(codigo ? { codigo } : {}),
      ...(limitemensalautorizacao ? { limitemensalautorizacao } : {}),
      ...(pro_nu_parcelas_financiadas ? { pro_nu_parcelas_financiadas } : {}),
      ...(pro_id_tipo_contrato ? { pro_id_tipo_contrato } : {}),
      ...(pro_id_regra_vigencia ? { pro_id_regra_vigencia } : {}),
      ...(prd_in_bloqueado ? { prd_in_bloqueado } : {}),
      ...(prd_in_renovaauto ? { prd_in_renovaauto } : {}),
      ...(descricao ? { descricao } : {}),
    };

    produto.update(data);

    return res.json({ error: null, data: produto });
  }

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const produto = await Produto.findByPk(id);

    if (!produto) throw new Error('Produto não encontrado');

    produto.destroy();

    return res.json({ error: null });
  }
}

export default new ProdutoController();
