import Pessoa from '../models/Sequelize/Pessoa';
import Telefone from '../models/Sequelize/Telefone';
import Endereco from '../models/Sequelize/Endereco';
import Email from '../models/Sequelize/Email';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import PessoaJuridica from '../models/Sequelize/PessoaJuridica';

import Contrato from '../models/Sequelize/Contrato';

class PessoaController {
  async index(req, res) {
    const contrato = await Contrato.scope('pessoaFisica').findAll({
      limit: 10,
    });

    console.log(contrato);

    // const pessoa = await Pessoa.findAll({
    //   limit: 10,
    //   include: [
    //     {
    //       model: PessoaJuridica,
    //       as: 'pessoajuridica',
    //       required: false,
    //     },
    //     {
    //       model: PessoaFisica,
    //       as: 'pessoafisica',
    //       required: false,
    //     },
    //     {
    //       model: Telefone,
    //       as: 'telefones',
    //     },
    //     {
    //       model: Endereco,
    //       as: 'enderecos',
    //     },
    //     {
    //       model: Email,
    //       as: 'emails',
    //     },
    //   ],
    // });
    // const dadosPessoa = await pessoa.getPessoable();
    // // console.log('pessoa', pessoa);
    // console.log('dados', dadosPessoa);

    res.end('ok');
  }
}

export default new PessoaController();
