import queryStringConverter from 'sequelize-querystring-converter';
import Ocorrencia from '../models/Sequelize/Ocorrencia';

class OcorrenciaController {
  async index(req, res) {
    const { page = 1, limit = 20, ...query } = req.query;
    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    const ocorrencias = await Ocorrencia.findAll(criteria);
    return res.json({ error: null, data: ocorrencias });
  }

  async store(req, res) {
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
  }

  async update(req, res) {
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
  }
}

export default new OcorrenciaController();
