import { Op } from 'sequelize';

import Endereco from '../models/Sequelize/Endereco';
import Cidade from '../models/Sequelize/Cidade';
import Estado from '../models/Sequelize/Estado';
import Bairro from '../models/Sequelize/Bairro';

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
  }) {
    const t = transaction || (await sequelize.transaction());

    const verifyExistsEndereco = await Endereco.findOne({
      where: {
        logradouro,
        bairro,
        id_cidade: cidade,
        cep,
        complemento,
        numero,
        dadosid: pessoa.id,
      },
    });

    const findCidade = await Cidade.findOne({ where: { municipio_codigo: cidade } });
    const findEstado = await Estado.findOne({ where: { codigo: findCidade.codigo_uf } });
    const findBairro = await Bairro.findOne({
      where: { municipioid: findCidade.municipio_codigo, bairro: { [Op.iLike]: `%${bairro}%` } },
    });

    if (!findCidade) throw new Error('Cidade não encontrada');

    if (verifyExistsEndereco) {
      await verifyExistsEndereco.destroy({ transaction: t });
    }

    if (end_in_principal) {
      const verifyEnderecoPrincipal = await Endereco.findOne({
        where: {
          end_in_principal: true,
          dadosid: pessoa.id,
        },
      });

      if (verifyEnderecoPrincipal)
        await verifyEnderecoPrincipal.update({ end_in_principal: false }, { transaction: t });
    }

    await Endereco.create(
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
  }
}
