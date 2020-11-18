import Endereco from '../models/Sequelize/Endereco';

export default class AdicionarEnderecoService {
  static async execute({
    pessoa,
    tipoenderecoid = '',
    logradouro = '',
    bairro = '',
    cidade = '',
    estado = '',
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
        cidade,
        estado,
        cep,
        complemento,
        vinculoid,
        numero,
        dadosid: pessoa.id,
      },
    });
    console.log(verifyExistsEndereco);
    if (verifyExistsEndereco) return;

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
        cidade,
        estado,
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
