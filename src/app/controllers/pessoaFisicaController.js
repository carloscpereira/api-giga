import queryStringConverter from 'sequelize-querystring-converter';
import sequelize, { Op } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import Vinculo from '../models/Sequelize/Vinculo';
import PessoaFisica from '../models/Sequelize/PessoaFisica';
import Telefone from '../models/Sequelize/Telefone';
import Email from '../models/Sequelize/Email';
import Endereco from '../models/Sequelize/Endereco';
import EstadoCivil from '../models/Sequelize/EstadoCivil';

class PessoaFisicaController {
  async index(req, res) {
    const {
      page = 1,
      limit = 20,
      with: includes,
      filter = {},
      ...query
    } = req.query;

    const columns = includes ? includes.split(',') : [];

    const { telefone = {}, endereco = {}, email = {} } = filter;

    const criteria = queryStringConverter.convert({
      query: { limit, ...query, offset: (page - 1) * limit },
    });

    const criteriaTelefone = queryStringConverter.convert({ query: telefone });
    const criteriaEndereco = queryStringConverter.convert({ query: endereco });
    const criteriaEmail = queryStringConverter.convert({ query: email });
    const pessoas = await Pessoa.findAll({
      ...criteria,
      include: [
        {
          model: PessoaFisica,
          attributes: {
            exclude: ['id'],
          },
          as: 'dadospessoafisica',
          required: true,
          include: {
            model: EstadoCivil,
            as: 'estadocivil',
            attributes: ['descricao'],
          },
        },
        {
          model: Vinculo,
          as: 'vinculos',
          through: {
            attributes: [],
          },
          attributes: ['id', 'descricao'],
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
        ...(columns.includes('emails')
          ? [{ model: Email, as: 'emails', required: false, ...criteriaEmail }]
          : []),
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

  async store(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        Nome,
        Rg,
        Cpf,
        DataNascimento,
        Sexo,
        EstadoCivil,
        EstadoCivilId,
        OrgaoEmissor,
        Vinculos,
        Enderecos,
        Telefones,
        Emails,
        TiposContrato,
      } = req.body;

      const vinculos = await Vinculo.findAll({
        where: { id: { [Op.in]: Vinculos } },
      });

      const enderecos = Enderecos.map(({}) => ({}));
      const telefones = Telefones.map(({}) => ({}));
      const emails = Emails.map(
        ({ Descricao, TipoEmailId = 3, isPrincipal = false }) => ({
          descricao: Descricao,
          tipoemailid: TipoEmailId,
          ema_in_principal: isPrincipal,
          vinculoid: 4,
        })
      );

      await P;

      return res.end('ok');
    } catch (error) {
      return res
        .status(500)
        .json({ erro: 500, data: { message: 'Error in transaction' } });
    }
  }
}

export default new PessoaFisicaController();
