import { QueryTypes, Op } from 'sequelize';

import Pessoa from '../models/Sequelize/Pessoa';
import Vinculo from '../models/Sequelize/Vinculo';
import AtributoVinculo from '../models/Sequelize/AtributoVinculo';
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
  static async execute({ pessoa, vinculo, atributos, sequelize, transaction }) {
    if (pessoa instanceof Pessoa) {
      if (typeof atributos !== 'object') throw new Error('Atributos precisa ser um objeto');

      const vinculoGet = await Vinculo.findOne({
        where: {
          [Op.or]: [
            ...(typeof vinculo === 'number' ? [{ id: vinculo }] : []),
            { descricao: { [Op.iLike]: `%${vinculo}%` } },
          ],
        },
      });

      console.log('pessoa: ', atributos);
      console.log('vinculo: ', vinculo);

      if (!vinculo) throw new Error('Vinculo não encontrado');

      if (await pessoa.hasVinculos(vinculoGet)) return;

      let atributosVinculo = await sequelize.query('SELECT * FROM sp_camposdinamicos WHERE sp_vinculoid = :vinculoid', {
        replacements: { vinculoid: vinculoGet.id },
        type: QueryTypes.SELECT,
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

      await pessoa.addVinculos([vinculoGet], { transaction });
      // eslint-disable-next-line no-restricted-syntax
      for (const atributo of atributosVinculo) {
        if (atributos[snakeToPascal(atributo.descricaocampo)]) {
          // eslint-disable-next-line no-await-in-loop
          await AtributoVinculo.create(
            {
              pessoaid: pessoa.id,
              vinculoid: vinculoGet.id,
              campo: atributo.id,
              dadocampo: atributos[snakeToPascal(atributo.descricaocampo)],
            },
            { transaction }
          );
        }
      }
    } else {
      throw new Error('Você precisa dar uma instancia de pessoa para efetuar o registro de vínculo');
    }
  }
}
