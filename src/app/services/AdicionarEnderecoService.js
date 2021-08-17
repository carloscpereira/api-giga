import { Op, Sequelize, Transaction } from 'sequelize';

import Endereco from '../models/Sequelize/Endereco';
import Cidade from '../models/Sequelize/Cidade';
import Estado from '../models/Sequelize/Estado';
import Bairro from '../models/Sequelize/Bairro';
import AppError from '../errors/AppError';

export default class AdicionarEnderecoService {
  static async execute({
    pessoa,
    tipoenderecoid = '',
    logradouro = '',
    bairro = '',
    cidade = '',
    cep = '',
    complemento = '',
    vinculoid,
    numero = '',
    end_in_principal = false,
    sequelize,
    transaction,
    estado,
  }) {
    let t = transaction;

    if (!sequelize || !(sequelize instanceof Sequelize)) {
      throw new AppError(
        500,
        'Não foi possível estabelecer uma conexão com o banco de dados, verifique se houve a instancia da conexão'
      );
    }

    if (!transaction || !(transaction instanceof Transaction)) {
      t = await sequelize.transaction();
    }

    const verifyExistsEndereco = await Endereco.findOne({
      where: {
        logradouro,
        bairro,
        cidade,
        cep,
        complemento,
        numero,
        dadosid: pessoa.id,
      },
      transaction: t,
    });

    const findEstado = await Estado.findOne({ where: { sigla: { [Op.iLike]: `%${estado}%` } }, transaction: t });
    const findCidade = await Cidade.findOne({
      where: { [Op.and]: [{ municipio_nome: { [Op.iLike]: `%${cidade}%` } }, { codigo_uf: findEstado.codigo }] },
      transaction: t,
    });
    const findBairro = await Bairro.findOne({
      where: { municipioid: findCidade.municipio_codigo, bairro: { [Op.iLike]: `%${bairro}%` } },
      transaction: t,
    });

    if (!findCidade) throw new AppError(400, 'Cidade não encontrada');

    if (verifyExistsEndereco) {
      return verifyExistsEndereco;
    }

    if (end_in_principal) {
      const verifyEnderecoPrincipal = await Endereco.findOne({
        where: {
          end_in_principal: true,
          dadosid: pessoa.id,
        },
        transaction: t,
      });

      if (verifyEnderecoPrincipal)
        await verifyEnderecoPrincipal.update({ end_in_principal: false }, { transaction: t });
    }

    const endereco = await Endereco.create(
      {
        tipoenderecoid,
        dadosid: pessoa.id,
        bairro,
        cidade: findCidade.municipio_nome,
        logradouro,
        estado: findEstado.sigla,
        id_estado: findEstado.codigo,
        id_cidade: findCidade.municipio_codigo,
        bairroid: findBairro ? findBairro.id : null,
        cep,
        complemento,
        vinculoid,
        numero,
        end_in_principal,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();

    return endereco;
  }
}
