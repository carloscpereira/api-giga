const DEFAULT_ERR_RESPONSE = {
  error: 503,
  data: {
    message: 'Internal Error',
  },
};

export default class RedeCredenciada {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query(
        `SELECT DISTINCT CONTRATO.id_pessoa, CASE WHEN DPJ.nomefantasia IS NULL THEN CONTRATO.nome_pessoa WHEN DPJ.nomefantasia IS NOT NULL THEN CONTRATO.nome_pessoa || ' - ' || DPJ.nomefantasia end AS NOME, TE.dadocampo, Array_to_string(SP_TELEFONE.numero, ', ') AS TELEFONE, Array_to_string(SP_TELEFONE.numlink, ', ') AS TELLINK, Array_to_string(Coalesce(den_esp.especialidades, cli_esp.especialidades), ', ') AS especialidades, sp_endereco.logradouro AS ENDERECO, sp_endereco.numero, sp_endereco.complemento, Coalesce(BAI.bai_nome, sp_endereco.bairro) AS BAIRRO, MUN.mun_nome AS CIDADE, UF.uf_sigla AS SIGLA_ESTADO, sp_endereco.cep FROM vw_contrato_pessoa AS CONTRATO INNER JOIN sp_endereco ON sp_endereco.dadosid = CONTRATO.id_pessoa INNER JOIN sc_localidade.localidade_municipio MUN ON MUN.mun_nome2 = sp_endereco.cidade AND MUN.id_uf = sp_endereco.id_estado INNER JOIN sc_localidade.localidade_uf UF ON UF.id_uf = MUN.id_uf LEFT JOIN sc_localidade.localidade_bairro BAI ON Upper(BAI.bai_nome) = Upper(sp_endereco.bairro) AND BAI.id_mun = MUN.id_mun INNER JOIN(SELECT enderecoid, Array_agg(CASE Char_length(numero) WHEN 8 THEN Substring(numero FROM 1 FOR 4) || '-' || Substring(numero FROM 5 FOR 4) WHEN 9 THEN Substring(numero FROM 1 FOR 1 ) || ' ' || Substring(numero FROM 2 FOR 4) || '-' || Substring(numero FROM 6 FOR 4) WHEN 10 THEN '(' || Substring(numero FROM 1 FOR 2) || ') ' || Substring(numero FROM 3 FOR 4) || '-' || Substring(numero FROM 7 FOR 4) WHEN 11 THEN CASE Substring(numero FROM 1 FOR 1) WHEN '0' THEN '(' || Substring(numero FROM 1 FOR 3) || ') ' || Substring(numero FROM 4 FOR 4) || '-' || Substring(numero FROM 8 FOR 4) ELSE '(' || Substring(numero FROM 1 FOR 2 ) || ') ' || Substring(numero FROM 3 FOR 1 ) || ' ' || Substring(numero FROM 4 FOR 4 ) || '-' || Substring(numero FROM 8 FOR 4 ) end ELSE numero end) AS NUMERO, Array_agg('<a href=''tel:' || numero || '''>' || CASE Char_length(numero) WHEN 8 THEN Substring(numero FROM 1 FOR 4) || '-' || Substring(numero FROM 5 FOR 4) WHEN 9 THEN Substring(numero FROM 1 FOR 1) || ' ' || Substring(numero FROM 2 FOR 4) || '-' || Substring(numero FROM 6 FOR 4) WHEN 10 THEN '(' || Substring(numero FROM 1 FOR 2) || ') ' || Substring(numero FROM 3 FOR 4) || '-' || Substring(numero FROM 7 FOR 4) WHEN 11 THEN CASE Substring(numero FROM 1 FOR 1) WHEN '0' THEN '(' || Substring(numero FROM 1 FOR 3) || ') ' || Substring(numero FROM 4 FOR 4) || '-' || Substring(numero FROM 8 FOR 4) ELSE '(' || Substring(numero FROM 1 FOR 2) || ') ' || Substring(numero FROM 3 FOR 1) || ' ' || Substring(numero FROM 4 FOR 4) || '-' || Substring(numero FROM 8 FOR 4) end ELSE numero end || '</a>') AS NUMLINK FROM sp_telefone WHERE tipotelefoneid IN( 1, 2, 6, 7, 8 ) AND vinculoid IN ( 3, 33 ) GROUP BY( enderecoid )) AS SP_TELEFONE ON SP_TELEFONE.enderecoid = sp_endereco.id INNER JOIN sp_tipoendereco ON sp_tipoendereco.id = sp_endereco.tipoenderecoid INNER JOIN cn_contrato ON cn_contrato.id = CONTRATO.id_contrato LEFT JOIN sp_dadospessoajuridica DPJ ON DPJ.id = CONTRATO.id_pessoa LEFT JOIN sp_pessoaatributovinculo TE ON TE.pessoaid = CONTRATO.id_pessoa AND TE.campo = 8 AND ( TE.vinculoid IN ( 3, 33 ) ) LEFT JOIN sp_pessoaatributovinculo RE ON RE.pessoaid = CONTRATO.id_pessoa AND RE.campo = 1 AND RE.vinculoid = 3 LEFT JOIN (SELECT DPF.dentistaid, Array_agg(P.descricao) AS PLANOS, Array_agg(P.id) AS ID_PLANOS FROM cn_dentistapf DPF JOIN (SELECT Max(versaoplanoid), planoid, dentistaid FROM cn_dentistaplano GROUP BY planoid, dentistaid) DPLAN ON DPLAN.dentistaid = DPF.dentistaid JOIN cn_plano P ON P.id = DPLAN.planoid GROUP BY DPF.dentistaid UNION ALL SELECT DPJ.clinicaid, Array_agg(P.descricao), Array_agg(P.id) FROM cn_dentistapj DPJ JOIN (SELECT Max(versaoplanoid), planoid, clinicaid FROM cn_clinicaplano GROUP BY planoid, clinicaid) DPLAN ON DPLAN.clinicaid = DPJ.clinicaid JOIN cn_plano P ON P.id = DPLAN.planoid GROUP BY dpj.clinicaid) AS DEN_PLAN ON DEN_PLAN.dentistaid = CONTRATO.id_pessoa LEFT JOIN (SELECT esp_den.dentistaid, Array_agg(descricao) AS especialidades, Array_agg(especialidadeid) AS id_especialidades FROM cn_especialidade esp INNER JOIN (SELECT DISTINCT dentistapfid AS dentistaid , especialidadeid FROM cn_especialidade_dentista) esp_den ON esp_den.especialidadeid = esp.id GROUP BY esp_den.dentistaid) AS den_esp ON den_esp.dentistaid = CONTRATO.id_pessoa LEFT JOIN (SELECT esp_den.contratoid, Array_agg(descricao) AS especialidades, Array_agg(especialidadeid) AS id_especialidades FROM cn_especialidade esp INNER JOIN (SELECT DISTINCT numerocontrato AS contratoid, especialidadeid FROM cn_especialidade_clinica) esp_den ON esp_den.especialidadeid = esp.id GROUP BY esp_den.contratoid) AS cli_esp ON cli_esp.contratoid = CONTRATO.id_contrato WHERE CONTRATO.id_tipo_contrato IN( 7, 8 ) AND CONTRATO.id_status = 8 AND sp_endereco.vinculoid IN( 3, 33 ) AND sp_tipoendereco.id IN( 2, 3, 4, 5 ) AND cn_contrato.bloqueadopesquisa = false`
      );

      if (!rows.length) return null;

      return rows;
    } catch (err) {
      return DEFAULT_ERR_RESPONSE;
    }
  }
}
