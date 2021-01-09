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
                          especialidades as "especialidades",
                          enderecos      as "enderecos",
                          cro            as "cro",
                          telefones      as "telefones",
                          emails         as "emails"
        FROM cn_dentista_clinica cdc
                INNER JOIN sp_dadospessoafisica spd ON cdc.dentistapfid = spd.id
                CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS enderecos
                                    FROM (SELECT * FROM sp_endereco WHERE cdc.dentistapfid = sp_endereco.dadosid) d) enderecos
                LEFT JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS emails
                                    FROM (SELECT * FROM sp_email WHERE cdc.dentistapfid = sp_email.dadosid) d) emails ON TRUE
                LEFT JOIN LATERAL (SELECT array_agg(DISTINCT ce.descricao) AS especialidades
                                    FROM cn_dentista_clinica cdc2
                                            INNER JOIN cn_especialidade ce ON cdc2.especialidadeid = ce.id
                                    WHERE cdc.dentistapfid = cdc2.dentistapfid
                                      AND cdc.numerocontrato = cdc2.numerocontrato) especialidades ON TRUE
                CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS telefones
                                    FROM (SELECT * FROM sp_telefone WHERE cdc.dentistapfid = sp_telefone.dadosid) d) telefones
                LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                                    FROM sp_pessoaatributovinculo pav
                                            INNER JOIN sp_camposdinamicos sc on pav.campo = sc.campo
                                    WHERE pav.pessoaid = cdc.dentistapfid
                                      AND pav.vinculoid = 63
                                      AND sc.descricaocampo ILIKE '%registro do conselho'
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
