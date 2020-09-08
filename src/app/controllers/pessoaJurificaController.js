import Pessoa from '../models/Sequelize/Pessoa';

import Vinculo from '../models/Sequelize/Vinculo';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';

class PessoaJurificaController {
  async index(req, res) {
    const pessoa = await Pessoa.findAll({
      limit: 10,
      include: [
        {
          model: PessoaJuridica,
          attributes: {
            exclude: ['id'],
          },
          as: 'dadospessoajuridica',
          required: true,
        },
        {
          model: Vinculo,
          as: 'vinculos',
          through: {
            attributes: [],
          },
          attributes: ['id', 'descricao'],
        },
      ],
    });

    res.json(pessoa);
  }
}

export default new PessoaJurificaController();
