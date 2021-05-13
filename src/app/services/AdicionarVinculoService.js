import { QueryTypes, Op, Transaction, Sequelize } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import Vinculo from '../models/Sequelize/Vinculo';
import AtributoVinculo from '../models/Sequelize/AtributoVinculo';
import PessoaVinculo from '../models/Sequelize/PessoaVinculo';
// import PessoaFisica from '../models/Sequelize/PessoaFisica';
// import EstadoCivil from '../models/Sequelize/EstadoCivil';

import RemoverAcentos from '../helpers/RemoverAcentos';

const snakeToPascal = (string) => {
  return string
    .split('/')
    .map((snake) =>
      snake
        .split('_')
        .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join('')
    )
    .join('/');
};

// const pascalToSnake = (string) => {
//   return string
//     .replace(/\.?([A-Z]+)/g, (x, y) => {
//       return `_${y.toLowerCase()}`;
//     })
//     .replace(/^_/, '');
// };

export default class AdicinarVinculoPFService {
  static async execute({ pessoa, vinculo, atributos, alteravel = true, sequelize, transaction }) {
    if (pessoa instanceof Pessoa) {
      if (typeof atributos !== 'object') throw new Error('Atributos precisa ser um objeto');

      let t = transaction;
      // Testa se a instancia de conexão com o banco de dados foi passada corretamente
      if (!sequelize || !(sequelize instanceof Sequelize)) {
        throw new Error('Não foi possível estabalecer conexão com o banco de dados');
      }

      // Testa se a instancia de transação foi mandada corretamente, caso não, cria uma nova instancia
      if (!transaction || !(transaction instanceof Transaction)) {
        t = await sequelize.transaction();
      }

      const vinculoGet = await Vinculo.findOne(
        {
          where: {
            [Op.or]: [
              ...(typeof vinculo === 'number' ? [{ id: vinculo }] : []),
              { descricao: { [Op.iLike]: `%${vinculo}%` } },
            ],
          },
        },
        { transaction: t }
      );

      if (!vinculo) throw new Error('Vinculo não encontrado');

      if (!alteravel && (await pessoa.hasVinculos(vinculoGet, { transaction: t }))) return;
      const existsVinculo = await pessoa.hasVinculos(vinculoGet, { transaction: t });
      if (existsVinculo) {
        await AtributoVinculo.destroy({ where: { vinculoid: vinculoGet.id, pessoaid: pessoa.id }, transaction: t });
        await pessoa.removeVinculos([vinculoGet], { transaction: t });
      }

      let atributosVinculo = await sequelize.query('SELECT * FROM sp_camposdinamicos WHERE sp_vinculoid = :vinculoid', {
        replacements: { vinculoid: vinculoGet.id },
        type: QueryTypes.SELECT,
        transaction: t,
      });

      const propertyErrors = [];

      atributosVinculo = atributosVinculo.map((atr) => ({
        ...atr,
        descricaocampo: RemoverAcentos(atr.descricaocampo).toLowerCase().replace(/ /gi, '_'),
        obrigatorio: atr.obrigatorio === '1',
      }));

      atributosVinculo
        .filter((atr) => atr.obrigatorio)
        .forEach((atr) => {
          // eslint-disable-next-line no-prototype-builtins
          if (!atributos.hasOwnProperty(snakeToPascal(atr.descricaocampo)))
            propertyErrors.push(
              `O campo ${snakeToPascal(atr.descricaocampo)} é obrigatório para o vínculo de ${vinculoGet.descricao}`
            );
        });

      if (propertyErrors.length > 0) throw new Error(propertyErrors);

      const vinculoExists = await PessoaVinculo.findOne({
        where: { pessoaid: pessoa.id, vinculoid: vinculoGet.id },
        transaction: t,
      });

      if (!vinculoExists) {
        await PessoaVinculo.create({ pessoaid: pessoa.id, vinculoid: vinculoGet.id }, { transaction: t });
      }

      // await pessoa.addVinculos([vinculoGet], { transaction });
      // eslint-disable-next-line no-restricted-syntax
      for (const atributo of atributosVinculo) {
        if (atributos[snakeToPascal(atributo.descricaocampo)]) {
          const existsAtributeVinculo = await AtributoVinculo.findOne({
            where: {
              pessoaid: pessoa.id,
              vinculoid: vinculoGet.id,
              campo: atributo.campo,
            },
            transaction: t,
          });

          if (existsAtributeVinculo) {
            await existsAtributeVinculo.destroy({ transaction: t });
          }
          // eslint-disable-next-line no-await-in-loop
          await AtributoVinculo.create(
            {
              pessoaid: pessoa.id,
              vinculoid: vinculoGet.id,
              dadocampo: atributos[snakeToPascal(atributo.descricaocampo)].toString(),
              campo: atributo.campo,
            },
            { transaction: t }
          );
        }
      }

      if (!transaction) t.commit();
    } else {
      throw new Error('Você precisa dar uma instancia de pessoa para efetuar o registro de vínculo');
    }
  }
}
