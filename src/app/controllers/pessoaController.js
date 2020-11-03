import Pessoa from '../models/Sequelize/Pessoa';
import Telefone from '../models/Sequelize/Telefone';
import Endereco from '../models/Sequelize/Endereco';
import Email from '../models/Sequelize/Email';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';

class PessoaController {
  async index(req, res) {
    const pessoa = await Pessoa.findAll({
      limit: 10,
      include: [
        {
          model: PessoaJuridica,
          as: 'pessoajuridica',
          required: false,
        },
        {
          model: PessoaFisica,
          as: 'pessoafisica',
          required: false,
        },
        {
          model: Telefone,
          as: 'telefones',
        },
        {
          model: Endereco,
          as: 'enderecos',
        },
        {
          model: Email,
          as: 'emails',
        },
      ],
    });

    return res.json({ pessoa });
  }
}

export default new PessoaController();
