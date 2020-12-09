import * as Yup from 'yup';
import queryStringConverter from 'sequelize-querystring-converter';
import Contrato from '../models/Sequelize/Contrato';
import TipoContrato from '../models/Sequelize/TipoContrato';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';
import TipoTabelaUso from '../models/Sequelize/TipoTabelaUso';
import TipoOcorrencia from '../models/Sequelize/TipoOcorrencia';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';
import Status from '../models/Sequelize/Status';
import Parcela from '../models/Sequelize/Parcela';
import Titulo from '../models/Sequelize/Titulo';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

import CriarContratoService from '../services/CriaContratoService';
// import MigrarContratoService from '../services/MigrarContratoService';

import RemoveMembroContratoService from '../services/RemoveMembroContratoService';
import AdicionarMembroContratoService from '../services/AdicionarMembroContratoService';

class ContratoController {
  async index(req, res) {
    const { limit = 20, page = 1, ...query } = req.query;
    const offset = (page - 1) * limit;

    const criteria = queryStringConverter.convert({ query });
    const transaction = await req.sequelize.transaction();
    const contratos = await Contrato.findAll({
      ...criteria,
      limit,
      offset,
      attributes: { exclude: ['infoStatus'] },
      include: [
        { model: PessoaJuridica, as: 'operadora', attributes: ['id', 'nomefantasia', 'razaosocial', 'cnpj'] },
        { model: PessoaFisica, as: 'responsavel_pessoafisica' },
        { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
        { model: Status, as: 'infoStatus', attributes: ['descricao'] },
        { model: TipoCarteira, as: 'infoCarteira', attributes: ['descricao'] },
        { model: TipoContrato, as: 'infoContrato', attributes: ['descricao'] },
        { model: TipoTabelaUso, as: 'infoTabelaUso', attributes: ['descricao'] },
        { model: TipoOcorrencia, as: 'infoAdesao', attributes: ['descricao'] },
        { model: TipoOcorrencia, as: 'infoCancelamento', attributes: ['descricao'] },
        {
          model: GrupoFamiliar,
          as: 'gruposfamiliar',
          include: [
            {
              model: PessoaFisica,
              as: 'beneficiarios',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },

            {
              model: PessoaFisica,
              as: 'responsaveis',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },
          ],
        },
      ],
      transaction,
    });
    await transaction.rollback();

    return res.json({ error: null, data: contratos });
  }

  async show(req, res) {
    const { id } = req.params;

    const contrato = await Contrato.findByPk(id, {
      include: [
        { model: PessoaFisica, as: 'responsavel_pessoafisica' },
        { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
      ],
    });

    return res.json({ error: null, data: contrato });
  }

  async store(req, res) {
    console.log(req.formValidation);
    // const contrato = await Contrato.create(data);
    const contrato = await CriarContratoService.execute(req);

    const responseContrato = await Contrato.findOne({
      where: {
        id: contrato.id,
      },
      include: [{ model: Titulo, as: 'titulos', include: [{ model: Parcela, as: 'parcelas' }] }],
    });

    return res.json({ error: null, data: responseContrato });
  }

  // async migrar(req, res) {
  //   console.log(req.formValidation);

  //   const contrato = await MigrarContratoService.execute({
  //     id_contrato: req.params.id,
  //     request: req.body,
  //     sequelize: req.sequelize,
  //   });

  //   return res.json(contrato);
  // }

  async update(req, res) {
    const {
      body: {
        numerocontrato = null,
        numeroproposta = null,
        operadoraid = null,
        statusid = null,
        dataadesao = null,
        datacancelamento = null,
        dataregistrosistema = null,
        datalimitecancelamento = null,
        datainicialvigencia = null,
        datafinalvigencia = null,
        ciclovigenciacontrato = null,
        quantidademesesvigencia = null,
        temporeativacao = null,
        prazolimitebloqueio = null,
        obs = null,
        tipocontratoid = null,
        tipotabelausoid = null,
        descontotabelauso = null,
        chaveex = null,
        tipodecarteiraid = null,
        databloqueio = null,
        motivoadesaoid = null,
        motivocancelamentoid = null,
        datareativacao = null,
        bloqueadopesquisa = null,
        localid = null,
        con_in_renovacao_auto = null,
        con_dt_geracao_parcelas = null,
        con_in_situacao = null,
        con_id_regra_vigencia = null,
        importado = null,
        con_nu_prazo_cancela_inad = null,
        tipodecarteiracontratoid = null,
        id_gld = null,
        centrocustoid = null,
      },
      params: { id = null },
    } = req.body;

    const data = {
      ...(numerocontrato ? { numerocontrato } : {}),
      ...(numeroproposta ? { numeroproposta } : {}),
      ...(operadoraid ? { operadoraid } : {}),
      ...(statusid ? { statusid } : {}),
      ...(dataadesao ? { dataadesao } : {}),
      ...(datacancelamento ? { datacancelamento } : {}),
      ...(dataregistrosistema ? { dataregistrosistema } : {}),
      ...(datalimitecancelamento ? { datalimitecancelamento } : {}),
      ...(datainicialvigencia ? { datainicialvigencia } : {}),
      ...(datafinalvigencia ? { datafinalvigencia } : {}),
      ...(ciclovigenciacontrato ? { ciclovigenciacontrato } : {}),
      ...(quantidademesesvigencia ? { quantidademesesvigencia } : {}),
      ...(temporeativacao ? { temporeativacao } : {}),
      ...(prazolimitebloqueio ? { prazolimitebloqueio } : {}),
      ...(obs ? { obs } : {}),
      ...(tipocontratoid ? { tipocontratoid } : {}),
      ...(tipotabelausoid ? { tipotabelausoid } : {}),
      ...(descontotabelauso ? { descontotabelauso } : {}),
      ...(chaveex ? { chaveex } : {}),
      ...(tipodecarteiraid ? { tipodecarteiraid } : {}),
      ...(databloqueio ? { databloqueio } : {}),
      ...(motivoadesaoid ? { motivoadesaoid } : {}),
      ...(motivocancelamentoid ? { motivocancelamentoid } : {}),
      ...(datareativacao ? { datareativacao } : {}),
      ...(bloqueadopesquisa ? { bloqueadopesquisa } : {}),
      ...(localid ? { localid } : {}),
      ...(con_in_renovacao_auto ? { con_in_renovacao_auto } : {}),
      ...(con_dt_geracao_parcelas ? { con_dt_geracao_parcelas } : {}),
      ...(con_in_situacao ? { con_in_situacao } : {}),
      ...(con_id_regra_vigencia ? { con_id_regra_vigencia } : {}),
      ...(importado ? { importado } : {}),
      ...(con_nu_prazo_cancela_inad ? { con_nu_prazo_cancela_inad } : {}),
      ...(tipodecarteiracontratoid ? { tipodecarteiracontratoid } : {}),
      ...(id_gld ? { id_gld } : {}),
      ...(centrocustoid ? { centrocustoid } : {}),
    };

    const contrato = await Contrato.update(data, {
      where: { id },
      returning: true,
    });

    return res.json({ error: null, data: contrato });
  }

  async adicionarAssociado(req, res) {
    const {
      body: { GrupoFamiliar: id_grupofamiliar, Vinculo: vinculo, ...beneficiario },
      params: { id: id_contrato },
      sequelize,
    } = req;

    await AdicionarMembroContratoService.execute({
      beneficiario,
      id_contrato,
      id_grupofamiliar,
      sequelize,
      vinculo,
    });

    const contrato = await Contrato.findByPk(id_contrato, {
      include: [
        { model: PessoaFisica, as: 'responsavel_pessoafisica' },
        { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
        {
          model: GrupoFamiliar,
          as: 'gruposfamiliar',
          include: [
            {
              model: PessoaFisica,
              as: 'beneficiarios',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },

            {
              model: PessoaFisica,
              as: 'responsaveis',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },
          ],
        },
      ],
    });

    return res.json({ error: null, data: contrato });
  }

  async removerAssociado(req, res) {
    const { id: id_contrato, beneficiarioid: id_beneficiario } = req.params;

    await RemoveMembroContratoService.execute({ sequelize: req.sequelize, id_beneficiario, id_contrato });

    const contrato = await Contrato.findByPk(id_contrato, {
      include: [
        { model: PessoaFisica, as: 'responsavel_pessoafisica' },
        { model: PessoaJuridica, as: 'responsavel_pessoajuridica' },
        {
          model: GrupoFamiliar,
          as: 'gruposfamiliar',
          include: [
            {
              model: PessoaFisica,
              as: 'beneficiarios',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },

            {
              model: PessoaFisica,
              as: 'responsaveis',
              attributes: { exclude: ['alteracao', 'secretariaid', 'usuario', 'status', 'tipodadosid'] },
              through: {
                as: 'dados',
                attributes: [
                  'dataadesao',
                  'ativo',
                  'datadesativacao',
                  'tipobeneficiarioid',
                  'versaoplanoid',
                  'planoid',
                  'tipobeneficiarioid',
                  'tipocarteiraid',
                  'valor',
                  'descontovalor',
                  'descontoporcent',
                ],
              },
            },
          ],
        },
      ],
    });

    return res.json({ error: null, data: contrato });
  }

  async delete(req, res) {
    const { id } = req.params;

    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(403).json({ error: 403, data: { message: 'Contrato cannot find ' } });
    }

    contrato.update({
      statusid: 7,
    });

    return res.status(201).json({
      error: null,
      data: { message: 'Contract canceled successfully' },
    });
  }

  async block(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      await schema.validate(req.params);

      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(401).json({ error: 401, data: { message: 'Contrato cannot find ' } });
      }

      await contrato.update({
        statusid: 3,
      });

      return res.status(201).json({
        error: null,
        data: { message: 'Contract successfully blocked' },
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res.status(404).json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async unlock(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      await schema.validate(req.params);

      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(401).json({ error: 401, data: { message: 'Contrato cannot find ' } });
      }

      if (contrato.statusid === 7) {
        return res.status(401).json({
          error: 401,
          data: {
            message: 'It is not possible to change a canceled contract ',
          },
        });
      }

      const contratoUpdated = await contrato.update(
        {
          statusid: 8,
        },
        {
          returning: true,
        }
      );

      return res.status(201).json({
        error: null,
        data: {
          message: 'Contract successfully unlocked',
          data: contratoUpdated,
        },
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res.status(404).json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new ContratoController();
