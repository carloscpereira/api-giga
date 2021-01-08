import { QueryTypes } from 'sequelize';
// import queryStringConverter from 'sequelize-querystring-converter';

class VinculoController {
  async index(req, res) {
    const { sequelize } = req;
    const { id, cpf, nome, corretorid } = req.query;

    // corretora = corretora || vendedor || 0;
    // vendedor = vendedor || corretora || 0;
    // const cpfvendedor = vendedor?.toString() || corretora?.toString() || '0';

    const vendedores = await sequelize.query(
      `
      SELECT sp_dadospessoafisica.id,
            sp_dadospessoafisica.nome,
            sp_dadospessoafisica.cpf,
            cn_corretorpf.id as corretorid
      FROM   sp_dadospessoafisica
            INNER JOIN cn_grupocorretores
                    ON cn_grupocorretores.corretorvendedor = sp_dadospessoafisica.id
            INNER JOIN cn_corretorpf
                    ON cn_corretorpf.corretorapjid =
                        cn_grupocorretores.corretorpessoaj
      WHERE  ( cn_grupocorretores.corretorvendedor IS NOT NULL )
          ${(id && 'AND sp_dadospessoafisica.id = :pessoaid') || ''}
          ${(cpf && 'AND sp_dadospessoafisica.cpf = :pessoacpf') || ''}
          ${(nome && 'AND sp_dadospessoafisica.nome ILIKE :pessoanome') || ''}
          ${(corretorid && 'AND cn_corretorpf.id = :corretorid') || ''}
      ORDER  BY sp_dadospessoafisica.nome
  `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          pessoaid: id,
          pessoacpf: cpf,
          pessoanome: `%${nome}%`,
          corretorid,
        },
      }
    );

    console.log(vendedores);

    return res.json({ error: null, data: vendedores });
  }
}

export default new VinculoController();
