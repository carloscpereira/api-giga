import { QueryTypes } from 'sequelize';

class ColaboradoresClinicaController {
  async index(req, res) {
    try {
      const {
        sequelize,
        params: { idcontrato },
      } = req;

      const colaboradores = await sequelize.query(
        `
        SELECT DISTINCT ON (nome) nome,
          spd.id,
          cpf,
          cro            as "cro"
        FROM cn_dentista_clinica cdc
        INNER JOIN sp_dadospessoafisica spd ON cdc.dentistapfid = spd.id
        LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                  FROM sp_pessoaatributovinculo pav
                  WHERE pav.pessoaid = cdc.dentistapfid
                    AND pav.vinculoid = 63
                    AND pav.campo = 1
                    AND pav.dadocampo IS NOT NULL
                  LIMIT 1) cro ON TRUE
        WHERE cdc.numerocontrato = :idcontrato;
      `,
        { type: QueryTypes.SELECT, replacements: { idcontrato } }
      );

      return res.json(colaboradores);
    } catch (error) {
      return res.status(500).json({ error: 500, data: { message: 'Internal server error' } });
    }
  }
}

export default new ColaboradoresClinicaController();
