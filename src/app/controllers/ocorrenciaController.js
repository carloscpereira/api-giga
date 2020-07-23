import * as Yup from 'yup';
import moment from 'moment';
import OcorrenciaQuerier from '../schemas/OcorrenciaQuerier';
import Ocorrencia from '../models/Ocorrencia';

class OcorrenciaController {
  async index(req, res) {
    const querier = new OcorrenciaQuerier(
      req.query,
      req.knex('cn_ocorrenciacontrato')
    );
    const ocorrencias = await querier.run();

    res.json({ error: null, data: ocorrencias });
  }

  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        dataocorrencia: Yup.date(),
        datavalidade: Yup.date(),
        statusid: Yup.number().integer().required(),
        obs: Yup.string(),
        pessoaagendante: Yup.number().integer(),
        descricao: Yup.string(),
        codigo: Yup.number().integer(),
        numerocontratoid: Yup.number().integer(),
        grupoocorrenciaid: Yup.number().integer(),
        subgrupoocorrencia: Yup.number().integer(),
        departamentoid: Yup.number().integer(),
        setorid: Yup.number().integer(),
        calendario_id: Yup.number().integer(),
        tipoocorrencia_calendario: Yup.number().integer(),
        ocorrenciasistema: Yup.string(),
        horaocorrencia: Yup.string(),
      });

      await schema.validate(req.body);

      const {
        dataocorrencia = new Date(),
        datavalidade = null,
        statusid = null,
        obs = null,
        pessoaagendante = null,
        descricao = null,
        codigo = null,
        numerocontratoid = null,
        grupoocorrenciaid = null,
        subgrupoocorrencia = null,
        departamentoid = null,
        setorid = null,
        calendario_id = null,
        tipoocorrencia_calendario = null,
        ocorrenciasistema = null,
        horaocorrencia = null,
      } = req.body;

      const data = {
        dataocorrencia,
        datavalidade,
        statusid,
        obs,
        pessoaagendante,
        descricao,
        codigo,
        numerocontratoid,
        grupoocorrenciaid,
        subgrupoocorrencia,
        departamentoid,
        setorid,
        calendario_id,
        tipoocorrencia_calendario,
        ocorrenciasistema,
        horaocorrencia,
      };

      const response = await new Ocorrencia(req.pool).create(data);

      if (response && response.error) {
        return res.status(response.error).json(response);
      }

      return res.json(response);
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
        dataocorrencia: Yup.date(),
        datavalidade: Yup.date(),
        statusid: Yup.number().integer().required(),
        obs: Yup.string(),
        pessoaagendante: Yup.number().integer(),
        descricao: Yup.string(),
        codigo: Yup.number().integer(),
        numerocontratoid: Yup.number().integer(),
        grupoocorrenciaid: Yup.number().integer(),
        subgrupoocorrencia: Yup.number().integer(),
        departamentoid: Yup.number().integer(),
        setorid: Yup.number().integer(),
        calendario_id: Yup.number().integer(),
        tipoocorrencia_calendario: Yup.number().integer(),
        ocorrenciasistema: Yup.string(),
        horaocorrencia: Yup.string(),
      });

      schema.validate(req.body);

      const {
        body: {
          dataocorrencia = new Date(),
          datavalidade = null,
          statusid = null,
          obs = null,
          pessoaagendante = null,
          descricao = null,
          codigo = null,
          numerocontratoid = null,
          grupoocorrenciaid = null,
          subgrupoocorrencia = null,
          departamentoid = null,
          setorid = null,
          calendario_id = null,
          tipoocorrencia_calendario = null,
          ocorrenciasistema = null,
          horaocorrencia = null,
        },
        params: { id = null },
      } = req;

      const data = {
        id,
        dataocorrencia,
        datavalidade,
        statusid,
        obs,
        pessoaagendante,
        descricao,
        codigo,
        numerocontratoid,
        grupoocorrenciaid,
        subgrupoocorrencia,
        departamentoid,
        setorid,
        calendario_id,
        tipoocorrencia_calendario,
        ocorrenciasistema,
        horaocorrencia,
      };

      const response = await new Ocorrencia(req.pool).update(data);

      if (response && response.error) {
        return res.status(response.error).json(response);
      }

      return res.json(response);
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

export default new OcorrenciaController();
