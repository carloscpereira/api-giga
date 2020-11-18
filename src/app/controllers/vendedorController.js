import { QueryTypes } from 'sequelize';
// import queryStringConverter from 'sequelize-querystring-converter';

class VinculoController {
  async index(req, res) {
    const { sequelize } = req;
    let { corretora, vendedor } = req.query;

    corretora = corretora || vendedor || 0;
    vendedor = vendedor || corretora || 0;
    const cpfvendedor = vendedor?.toString() || corretora?.toString() || '0';

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
           ${
             corretora || vendedor
               ? 'AND ( cn_corretorpf.id = :corretoraid OR sp_dadospessoafisica.id = :vendedorid OR sp_dadospessoafisica.cpf = :cpfvendedor OR sp_dadospessoafisica.nome ILIKE :nomevendedor  )'
               : ''
           }
      ORDER  BY sp_dadospessoafisica.nome
  `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          vendedorid: Number.parseInt(vendedor) || 0,
          corretoraid: Number.parseInt(corretora) || 0,
          cpfvendedor,
          nomevendedor: `%${cpfvendedor}%`,
        },
      }
    );

    console.log(vendedores);

    return res.json({ error: null, data: vendedores });
  }
}

export default new VinculoController();