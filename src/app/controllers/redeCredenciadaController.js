import { QueryTypes } from 'sequelize';

class RedeCredenciadaController {
  async index(req, res) {
    try {
      const { sequelize } = req;

      const contratos = await sequelize.query(
        `
      SELECT
        cc.id as "id",
        pf.nome as "apelido",
        pf.nome as "nome",
        pf.cpf as "documento",
        telefones as "telefones",
        enderecos as "enderecos",
        especialidades as "especialidades",
        emails as "emails",
        cro as "cro",
        planos as "planos"
      FROM cn_contrato cc
          INNER JOIN cn_dentistapf cd on cc.id = cd.id

          INNER JOIN sp_dadospessoafisica pf on cd.dentistaid = pf.id
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS telefones
                              FROM (SELECT * FROM sp_telefone WHERE pf.id = sp_telefone.dadosid AND sp_telefone.tipotelefoneid IS NOT NULL AND sp_telefone.tipotelefoneid NOT IN (3, 4)) d) telefones
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS enderecos
                              FROM (SELECT * FROM sp_endereco WHERE pf.id = sp_endereco.dadosid) d) enderecos
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS emails
                              FROM (SELECT * FROM sp_email WHERE pf.id = sp_email.dadosid) d) emails
          LEFT JOIN LATERAL (SELECT array_agg(DISTINCT ce.descricao) as especialidades
                                    FROM cn_especialidade_dentista
                                INNER JOIN cn_especialidade ce on cn_especialidade_dentista.especialidadeid = ce.id
                                    WHERE cc.id = cn_especialidade_dentista.numerocontrato) especialidades ON TRUE
          LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                                    FROM sp_pessoaatributovinculo pav
                                    INNER JOIN sp_camposdinamicos sc on pav.campo = sc.campo
                                    WHERE pav.pessoaid = pf.id
                                      AND pav.vinculoid = 3 AND sc.descricaocampo ILIKE '%registro do conselho' AND pav.dadocampo IS NOT NULL LIMIT 1) cro ON TRUE
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS planos
                              FROM (SELECT DISTINCT
                                cnpr.descricao as "plano", cnpr.registroans as "resgistro_ans", cs.descricao as "segmentacao_assistencial", ca.descricao as "area_cobertura"
                              FROM cn_dentistaplano dtp
                                LEFT JOIN cn_produto cnpr ON dtp.planoid = cnpr.planoid AND dtp.versaoplanoid = cnpr.versaoid
                                LEFT JOIN cn_segmentacaoassistencial cs on cnpr.segmentacaoassistencialid = cs.id
                                LEFT JOIN cn_areacobertura ca on cnpr.areacoberturaid = ca.id
                              WHERE dtp.dentistaid = pf.id) d) planos
      WHERE cc.tipocontratoid = 8
      AND cc.statusid = 8
      AND ((cc.bloqueadopesquisa IS NULL) OR (cc.bloqueadopesquisa IS NOT NULL AND cc.bloqueadopesquisa = false))
      UNION ALL
      -- Clinicas
      SELECT
      cc.id as "id",
        pj.nomefantasia as "apelido",
        pj.razaosocial as "nome",
        pj.cnpj as "documento",
        telefones as "telefones",
        enderecos as "enderecos",
        especialidades as "especialidades",
        emails as "emails",
        cro as "cro",
        planos as "planos"
      FROM cn_contrato cc
          INNER JOIN cn_dentistapj cd on cc.id = cd.id

          INNER JOIN sp_dadospessoajuridica pj on cd.clinicaid = pj.id
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS telefones
                              FROM (SELECT * FROM sp_telefone WHERE pj.id = sp_telefone.dadosid AND sp_telefone.tipotelefoneid IS NOT NULL AND sp_telefone.tipotelefoneid NOT IN (3, 4)) d) telefones
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS enderecos
                              FROM (SELECT * FROM sp_endereco WHERE pj.id = sp_endereco.dadosid) d) enderecos
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS emails
                              FROM (SELECT * FROM sp_email WHERE pj.id = sp_email.dadosid) d) emails
          LEFT JOIN LATERAL (SELECT array_agg(DISTINCT ce.descricao) as especialidades
                                    FROM cn_especialidade_clinica
                                            INNER JOIN cn_especialidade ce on cn_especialidade_clinica.especialidadeid = ce.id
                                    WHERE cc.id = cn_especialidade_clinica.numerocontrato) especialidades ON TRUE
          LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                                    FROM sp_pessoaatributovinculo pav
                                      INNER JOIN sp_camposdinamicos sc on pav.campo = sc.campo
                                      WHERE pav.pessoaid = pj.id
                                        AND pav.vinculoid = 33 AND sc.descricaocampo ILIKE '%registro do conselho clínica') cro ON TRUE
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS planos
                                      FROM (SELECT DISTINCT
                                        cnpr.descricao as "plano", cnpr.registroans as "resgistro_ans", cs.descricao as "segmentacao_assistencial", ca.descricao as "area_cobertura"
                                        FROM cn_clinicaplano clp
                                        LEFT JOIN cn_produto cnpr ON clp.planoid = cnpr.planoid AND clp.versaoplanoid = cnpr.versaoid
                                        LEFT JOIN cn_segmentacaoassistencial cs on cnpr.segmentacaoassistencialid = cs.id
                                        LEFT JOIN cn_areacobertura ca on cnpr.areacoberturaid = ca.id
                                      WHERE clp.clinicaid = pj.id ) d) planos
      WHERE cc.tipocontratoid = 7
      AND cc.statusid = 8
      AND ((cc.bloqueadopesquisa IS NULL) OR (cc.bloqueadopesquisa IS NOT NULL AND cc.bloqueadopesquisa = false));
      `,
        { type: QueryTypes.SELECT }
      );

      return res.json(contratos);
    } catch (error) {
      return res.status(500).json({ error: 500, data: { message: 'Internal server error' } });
    }
  }

  async show(req, res) {
    try {
      const {
        sequelize,
        params: { idcontrato },
      } = req;

      const contrato = await sequelize.query(
        `
      SELECT
        cc.id as "id",
        pf.nome as "apelido",
        pf.nome as "nome",
        pf.cpf as "documento",
        telefones as "telefones",
        enderecos as "enderecos",
        especialidades as "especialidades",
        emails as "emails",
        cro as "cro",
        planos as "planos"
      FROM cn_contrato cc
          INNER JOIN cn_dentistapf cd on cc.id = cd.id

          INNER JOIN sp_dadospessoafisica pf on cd.dentistaid = pf.id
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS telefones
                              FROM (SELECT * FROM sp_telefone WHERE pf.id = sp_telefone.dadosid) d) telefones
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS enderecos
                              FROM (SELECT * FROM sp_endereco WHERE pf.id = sp_endereco.dadosid) d) enderecos
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS emails
                              FROM (SELECT * FROM sp_email WHERE pf.id = sp_email.dadosid) d) emails
          LEFT JOIN LATERAL (SELECT array_agg(DISTINCT ce.descricao) as especialidades
                                    FROM cn_especialidade_dentista
                                INNER JOIN cn_especialidade ce on cn_especialidade_dentista.especialidadeid = ce.id
                                    WHERE cc.id = cn_especialidade_dentista.numerocontrato) especialidades ON TRUE
          LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                                    FROM sp_pessoaatributovinculo pav
                                    INNER JOIN sp_camposdinamicos sc on pav.campo = sc.campo
                                    WHERE pav.pessoaid = pf.id
                                      AND pav.vinculoid = 3 AND sc.descricaocampo ILIKE '%registro do conselho' AND pav.dadocampo IS NOT NULL LIMIT 1) cro ON TRUE
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS planos
                              FROM (SELECT DISTINCT
                                    cpl.descricao as plano,
                                    cvp.descricao as versao_plano
                                    FROM cn_dentistaplano dtp
                                    LEFT JOIN cn_plano cpl ON dtp.planoid = cpl.id
                                    LEFT JOIN cn_versaoplano cvp ON dtp.planoid = cvp.id
                                    WHERE dtp.dentistaid = pf.id ) d) planos
      WHERE cc.tipocontratoid = 8
      AND cc.statusid = 8
      AND ((cc.bloqueadopesquisa IS NULL) OR (cc.bloqueadopesquisa IS NOT NULL AND cc.bloqueadopesquisa = false))
      UNION ALL
      -- Clinicas
      SELECT
      cc.id as "id",
        pj.nomefantasia as "apelido",
        pj.razaosocial as "nome",
        pj.cnpj as "documento",
        telefones as "telefones",
        enderecos as "enderecos",
        especialidades as "especialidades",
        emails as "emails",
        cro as "cro",
        planos as "planos"
      FROM cn_contrato cc
          INNER JOIN cn_dentistapj cd on cc.id = cd.id

          INNER JOIN sp_dadospessoajuridica pj on cd.clinicaid = pj.id
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS telefones
                              FROM (SELECT * FROM sp_telefone WHERE pj.id = sp_telefone.dadosid) d) telefones
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS enderecos
                              FROM (SELECT * FROM sp_endereco WHERE pj.id = sp_endereco.dadosid) d) enderecos
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS emails
                              FROM (SELECT * FROM sp_email WHERE pj.id = sp_email.dadosid) d) emails
          LEFT JOIN LATERAL (SELECT array_agg(DISTINCT ce.descricao) as especialidades
                                    FROM cn_especialidade_clinica
                                            INNER JOIN cn_especialidade ce on cn_especialidade_clinica.especialidadeid = ce.id
                                    WHERE cc.id = cn_especialidade_clinica.numerocontrato) especialidades ON TRUE
          LEFT JOIN LATERAL (SELECT pav.dadocampo as cro
                                    FROM sp_pessoaatributovinculo pav
                                      INNER JOIN sp_camposdinamicos sc on pav.campo = sc.campo
                                      WHERE pav.pessoaid = pj.id
                                        AND pav.vinculoid = 33 AND sc.descricaocampo ILIKE '%registro do conselho clínica') cro ON TRUE
          CROSS JOIN LATERAL (SELECT array_to_json(array_agg(row_to_json(d))) AS planos
                                      FROM (SELECT DISTINCT
                                              cnpr.descricao, cnpr.registroans, cs.descricao, ca.descricao
                                            FROM cn_clinicaplano clp
                                              LEFT JOIN cn_produto cnpr ON clp.planoid = cnpr.planoid AND clp.versaoplanoid = cnpr.versaoid
                                              LEFT JOIN cn_segmentacaoassistencial cs on cnpr.segmentacaoassistencialid = cs.id
                                              LEFT JOIN cn_areacobertura ca on cnpr.areacoberturaid = ca.id
                                            WHERE clp.clinicaid = pj.id
                                            ) d) planos
      WHERE cc.tipocontratoid = 7
      AND cc.statusid = 8
      AND cc.id = :idcontrato
      AND ((cc.bloqueadopesquisa IS NULL) OR (cc.bloqueadopesquisa IS NOT NULL AND cc.bloqueadopesquisa = false));
      `,
        { type: QueryTypes.SELECT, replacements: { idcontrato }, plain: true }
      );

      return res.json(contrato);
    } catch (error) {
      return res.status(500).json({ error: 500, data: { message: 'Internal server error' } });
    }
  }
}

export default new RedeCredenciadaController();
