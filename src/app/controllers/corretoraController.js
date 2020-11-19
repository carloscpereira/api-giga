import { QueryTypes } from 'sequelize';

class ContratoController {
  async index(req, res) {
    const { nome_corretora, id } = req.query;
    const { sequelize } = req;

    let query = '';

    if (nome_corretora && id) {
      query = `WHERE sp_dadospessoajuridica.razaosocial ILIKE '%${nome_corretora}%' AND cn_corretorpf.id = ${id} `;
    } else if (nome_corretora) {
      query = `WHERE sp_dadospessoajuridica.razaosocial ILIKE '%${nome_corretora}%'`;
    } else if (id) {
      query = `WHERE cn_corretorpf.id = ${id} `;
    } else {
      query = '';
    }

    const corretoras = await sequelize.query(
      `
      SELECT
        cn_corretorpf.id          AS id,
        sp_dadospessoajuridica.razaosocial AS nome_corretora

      FROM   sp_dadospessoajuridica
          INNER JOIN cn_corretorpf
                  ON sp_dadospessoajuridica.id = cn_corretorpf.corretorapjid
          ${query}
      ORDER  BY sp_dadospessoajuridica.razaosocial
    `,
      { type: QueryTypes.SELECT }
    );

    return res.json({ error: null, data: corretoras });
  }
}

export default new ContratoController();
