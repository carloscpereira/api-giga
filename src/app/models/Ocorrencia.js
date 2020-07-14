const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class Ocorrencia {
  constructor(pool) {
    this.pool = pool;
  }

  async findPK(id) {
    try {
      const {
        rows,
      } = await this.pool.query(
        'SELECT * FROM cn_ocorrenciacontrato WHERE id = $1',
        [id]
      );

      if (!rows.length) return null;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async create(data) {
    try {
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
        calendario_id: calendarioId = null,
        tipoocorrencia_calendario: tipoocorrenciaCalendario = null,
        ocorrenciasistema = null,
        horaocorrencia = new Date().getHours(),
      } = data;

      const {
        rows,
      } = await this.pool.query(
        'INSERT INTO cn_ocorrenciacontrato (dataocorrencia, datavalidade, statusid, obs, pessoaagendante, descricao, codigo, numerocontratoid, grupoocorrenciaid, subgrupoocorrencia, departamentoid, setorid, calendario_id, tipoocorrencia_calendario, ocorrenciasistema, horaocorrencia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
        [
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
          calendarioId,
          tipoocorrenciaCalendario,
          ocorrenciasistema,
          horaocorrencia,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async update(data) {
    const {
      id = null,
      dataocorrencia = null,
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
      calendario_id: calendarioId = null,
      tipoocorrencia_calendario: tipoocorrenciaCalendario = null,
      ocorrenciasistema = null,
      horaocorrencia = null,
    } = data;

    try {
      const {
        rows,
      } = await this.pool.query(
        'UPDATE cn_ocorrenciacontrato SET dataocorrencia = COALESCE($1, dataocorrencia), datavalidade = COALESCE($2, datavalidade), statusid = COALESCE($3, statusid), obs = COALESCE($4, obs), pessoaagendante = COALESCE($5, pessoaagendante), descricao = COALESCE($6, descricao), codigo = COALESCE($7, codigo), numerocontratoid = COALESCE($8, numerocontratoid), grupoocorrenciaid = COALESCE($9, grupoocorrenciaid), subgrupoocorrencia = COALESCE($10, subgrupoocorrencia), departamentoid = COALESCE($11, departamentoid), setorid = COALESCE($12, setorid), calendario_id = COALESCE($13, calendario_id), tipoocorrencia_calendario = COALESCE($14, tipoocorrencia_calendario), ocorrenciasistema = COALESCE($15, ocorrenciasistema), horaocorrencia = COALESCE($16, horaocorrencia) WHERE id = $17 RETURNING *',
        [
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
          calendarioId,
          tipoocorrenciaCalendario,
          ocorrenciasistema,
          horaocorrencia,
          id,
        ]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }

  async destroy(id) {
    try {
      const {
        rows,
      } = await this.pool.query(
        'DELETE FROM cn_ocorrenciacontrato WHERE id = $1 RETURNING *',
        [id]
      );

      if (!rows.length) return DEFAULT_ERR_RESPONSE;

      return rows.shift();
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
