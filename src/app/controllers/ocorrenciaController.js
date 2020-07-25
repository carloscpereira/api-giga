import * as Yup from 'yup';
import queryStringConverter from 'sequelize-querystring-converter';
import Ocorrencia from '../models/Sequelize/Ocorrencia';

class OcorrenciaController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, ...query } = req.query;
      const criteria = queryStringConverter.convert({
        query: { limit, ...query, offset: (page - 1) * limit },
      });

      const ocorrencias = await Ocorrencia.findAll(criteria);
      return res.json({ error: null, data: ocorrencias });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal Server Error' } });
    }
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
      console.log(data);
      const response = await Ocorrencia.create(data);

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

      await schema.validate(req.body);

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
        ...(dataocorrencia ? { dataocorrencia } : {}),
        ...(datavalidade ? { datavalidade } : {}),
        ...(statusid ? { statusid } : {}),
        ...(obs ? { obs } : {}),
        ...(pessoaagendante ? { pessoaagendante } : {}),
        ...(descricao ? { descricao } : {}),
        ...(codigo ? { codigo } : {}),
        ...(numerocontratoid ? { numerocontratoid } : {}),
        ...(grupoocorrenciaid ? { grupoocorrenciaid } : {}),
        ...(subgrupoocorrencia ? { subgrupoocorrencia } : {}),
        ...(departamentoid ? { departamentoid } : {}),
        ...(setorid ? { setorid } : {}),
        ...(calendario_id ? { calendario_id } : {}),
        ...(tipoocorrencia_calendario ? { tipoocorrencia_calendario } : {}),
        ...(ocorrenciasistema ? { ocorrenciasistema } : {}),
        ...(horaocorrencia ? { horaocorrencia } : {}),
      };

      const response = await Ocorrencia.update(data, {
        where: { id },
        returning: true,
      });

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
