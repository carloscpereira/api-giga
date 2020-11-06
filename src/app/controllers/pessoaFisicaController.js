import queryStringConverter from 'sequelize-querystring-converter';
import { Op } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import Vinculo from '../models/Sequelize/Vinculo';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import Telefone from '../models/Sequelize/Telefone';
import Email from '../models/Sequelize/Email';
import Endereco from '../models/Sequelize/Endereco';
import EstadoCivil from '../models/Sequelize/EstadoCivil';
import Contrato from '../models/Sequelize/Contrato';
import GrupoFamiliar from '../models/Sequelize/GrupoFamiliar';

class PessoaFisicaController {
  async index(req, res) {
    const { page = 1, limit = 20, with: includes, filter = {}, nome, ...query } = req.query;

    const columns = includes ? includes.split(',') : [];

    const { telefone = {}, endereco = {}, email = {} } = filter;

    let criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });
    criteria = {
      ...criteria,
      where: {
        ...(nome ? { nome: { [Op.iLike]: `%${nome}%` } } : {}),
        ...criteria.where,
      },
    };
    console.log(query);
    console.log(criteria);

    const criteriaTelefone = queryStringConverter.convert({ query: telefone });
    const criteriaEndereco = queryStringConverter.convert({ query: endereco });
    const criteriaEmail = queryStringConverter.convert({ query: email });
    const pessoas = await PessoaFisica.findAll({
      ...criteria,
      include: [
        {
          model: EstadoCivil,
          as: 'estadocivil',
          attributes: ['descricao'],
        },
        {
          model: GrupoFamiliar,
          as: 'gruposfamiliar',
        },
        {
          model: Contrato,
          as: 'contratos',
        },
        ...(columns.includes('enderecos')
          ? [
              {
                model: Endereco,
                as: 'enderecos',
                required: false,
                ...criteriaEndereco,
              },
            ]
          : []),
        ...(columns.includes('emails') ? [{ model: Email, as: 'emails', required: false, ...criteriaEmail }] : []),
        ...(columns.includes('telefones')
          ? [
              {
                model: Telefone,
                as: 'telefones',
                required: false,
                ...criteriaTelefone,
              },
            ]
          : []),
      ],
    });

    return res.json({ error: null, data: pessoas });
  }

  // async store(req, res) {
  //   const transaction = await sequelize.transaction();

  //   try {
  //     const {
  //       Nome,
  //       Rg,
  //       Cpf,
  //       DataNascimento,
  //       Sexo,
  //       EstadoCivil,
  //       EstadoCivilId,
  //       OrgaoEmissor,
  //       Vinculos,
  //       Enderecos,
  //       Telefones,
  //       Emails,
  //       TiposContrato,
  //     } = req.body;

  //     const vinculos = await Vinculo.findAll({
  //       where: { id: { [Op.in]: Vinculos } },
  //     });

  //     const enderecos = Enderecos.map(({}) => ({}));
  //     const telefones = Telefones.map(({}) => ({}));
  //     const emails = Emails.map(
  //       ({ Descricao, TipoEmailId = 3, isPrincipal = false }) => ({
  //         descricao: Descricao,
  //         tipoemailid: TipoEmailId,
  //         ema_in_principal: isPrincipal,
  //         vinculoid: 4,
  //       })
  //     );

  //     await P;

  //     return res.end('ok');
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ erro: 500, data: { message: 'Error in transaction' } });
  //   }
  // }
}

export default new PessoaFisicaController();
