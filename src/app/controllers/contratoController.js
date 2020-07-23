import * as Yup from 'yup';
import queryStringConverter from 'sequelize-querystring-converter';
import Contrato from '../models/Sequelize/Contrato';

class ContratoController {
  async index(req, res) {
    try {
      const { query } = req;

      const criteria = queryStringConverter.convert({ query });

      const contratos = await Contrato.findAll(criteria);

      return res.json({ error: null, data: contratos });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal Server Error' } });
    }
  }

  async show(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      await schema.validate(req.params);

      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      return res.json({ error: null, data: contrato });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        numerocontrato: Yup.string(),
        numeroproposta: Yup.string(),
        operadoraid: Yup.number().integer(),
        statusid: Yup.number().integer().required(),
        dataadesao: Yup.date().required(),
        datacancelamento: Yup.date(),
        dataregistrosistema: Yup.date(),
        datalimitecancelamento: Yup.date(),
        datainicialvigencia: Yup.date().required(),
        datafinalvigencia: Yup.date().required(),
        ciclovigenciacontrato: Yup.number().integer().required(),
        quantidademesesvigencia: Yup.number().integer(),
        temporeativacao: Yup.date(),
        prazolimitebloqueio: Yup.number().integer().required(),
        obs: Yup.string(),
        tipocontratoid: Yup.number().integer().required(),
        tipotabelausoid: Yup.number().integer(),
        descontotabelauso: Yup.number(),
        chaveex: Yup.number().integer(),
        tipodecarteiraid: Yup.number().integer(),
        databloqueio: Yup.date(),
        motivoadesaoid: Yup.number().integer().required(),
        motivocancelamentoid: Yup.number().integer(),
        datareativacao: Yup.date(),
        bloqueadopesquisa: Yup.boolean().required().required(),
        localid: Yup.number().integer().required(),
        con_in_renovacao_auto: Yup.boolean().required(),
        con_dt_geracao_parcelas: Yup.date(),
        con_in_situacao: Yup.boolean().required(),
        con_id_regra_vigencia: Yup.number().integer().required(),
        importado: Yup.string().required(),
        con_nu_prazo_cancela_inad: Yup.number().integer().required(),
        tipodecarteiracontratoid: Yup.number().integer().required(),
        id_gld: Yup.number().integer(),
        centrocustoid: Yup.number().integer(),
      });

      await schema.validate(req.body);

      const {
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
      } = req.body;

      const data = {
        numerocontrato,
        numeroproposta,
        operadoraid,
        statusid,
        dataadesao,
        datacancelamento,
        dataregistrosistema,
        datalimitecancelamento,
        datainicialvigencia,
        datafinalvigencia,
        ciclovigenciacontrato,
        quantidademesesvigencia,
        temporeativacao,
        prazolimitebloqueio,
        obs,
        tipocontratoid,
        tipotabelausoid,
        descontotabelauso,
        chaveex,
        tipodecarteiraid,
        databloqueio,
        motivoadesaoid,
        motivocancelamentoid,
        datareativacao,
        bloqueadopesquisa,
        localid,
        con_in_renovacao_auto,
        con_dt_geracao_parcelas,
        con_in_situacao,
        con_id_regra_vigencia,
        importado,
        con_nu_prazo_cancela_inad,
        tipodecarteiracontratoid,
        id_gld,
        centrocustoid,
      };

      const contrato = await Contrato.create(data);

      return res.json({ error: null, data: contrato });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        body: Yup.object().shape({
          numerocontrato: Yup.string(),
          numeroproposta: Yup.string(),
          operadoraid: Yup.number().integer(),
          statusid: Yup.number().integer(),
          dataadesao: Yup.date(),
          datacancelamento: Yup.date(),
          dataregistrosistema: Yup.date(),
          datalimitecancelamento: Yup.date(),
          datainicialvigencia: Yup.date(),
          datafinalvigencia: Yup.date(),
          ciclovigenciacontrato: Yup.number().integer(),
          quantidademesesvigencia: Yup.number().integer(),
          temporeativacao: Yup.date(),
          prazolimitebloqueio: Yup.number().integer(),
          obs: Yup.string(),
          tipocontratoid: Yup.number().integer(),
          tipotabelausoid: Yup.number().integer(),
          descontotabelauso: Yup.number(),
          chaveex: Yup.number().integer(),
          tipodecarteiraid: Yup.number().integer(),
          databloqueio: Yup.date(),
          motivoadesaoid: Yup.number().integer(),
          motivocancelamentoid: Yup.number().integer(),
          datareativacao: Yup.date(),
          bloqueadopesquisa: Yup.boolean(),
          localid: Yup.number().integer(),
          con_in_renovacao_auto: Yup.boolean(),
          con_dt_geracao_parcelas: Yup.date(),
          con_in_situacao: Yup.boolean(),
          con_id_regra_vigencia: Yup.number().integer(),
          importado: Yup.string(),
          con_nu_prazo_cancela_inad: Yup.number().integer(),
          tipodecarteiracontratoid: Yup.number().integer(),
          id_gld: Yup.number().integer(),
          centrocustoid: Yup.number().integer(),
        }),
        params: Yup.object().shape({
          id: Yup.number().integer().required(),
        }),
      });

      await schema.validate(req);

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

      const contrato = Contrato.update(data, {
        where: { id },
        returning: true,
      });

      return res.json({ error: null, data: contrato });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }

  async delete(req, res) {
    try {
      const schema = Yup.object().shape({
        id: Yup.number().integer().required(),
      });

      await schema.validate(req.params);

      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res
          .status(401)
          .json({ error: 401, data: { message: 'Contrato cannot find ' } });
      }

      contrato.update({
        statusid: 7,
      });

      return res.status(201).json({
        error: null,
        data: { message: 'Contract canceled successfully' },
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(401).json({
          error: 401,
          data: { message: 'Validation fails', errors: err.errors },
        });
      }
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
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
        return res
          .status(401)
          .json({ error: 401, data: { message: 'Contrato cannot find ' } });
      }

      contrato.update({
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
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
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
        return res
          .status(401)
          .json({ error: 401, data: { message: 'Contrato cannot find ' } });
      }

      if (contrato.statusid === 7) {
        return res.status(401).json({
          error: 401,
          data: {
            message: 'It is not possible to change a canceled contract ',
          },
        });
      }

      const contratoUpdated = contrato.update(
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
          message: 'Contract successfully blocked',
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
      return res
        .status(404)
        .json({ error: 404, data: { message: 'Internal Server Error' } });
    }
  }
}

export default new ContratoController();
