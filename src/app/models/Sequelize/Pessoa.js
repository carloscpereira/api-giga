/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';
import PessoaFisica from './PessoaFisica';
import PessoaJuridica from './PessoaJuridica';

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

export default class Pessoa extends Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.BIGINT, primaryKey: true },
      },
      {
        sequelize,
        tableName: 'sp_pessoa',
        scopes: {
          pessoaFisica: {
            include: {
              model: PessoaFisica,
              as: 'dadospessoafisica',
              required: true,
            },
          },
          pessoaJuridica: {
            include: {
              model: PessoaJuridica,
              as: 'dadospessoajuridica',
              required: true,
            },
          },
        },
      }
    );

    return this;
  }

  async getPessoableType() {
    const vinculoPessoaFisica = await this.getVinculos({
      where: { tipopessoa: 'F' },
    });

    return vinculoPessoaFisica.length > 0 ? 'PessoaFisica' : 'PessoaJuridica';
  }

  async getPessoable(option) {
    const pessoableType = await this.getPessoableType();
    console.log(pessoableType);
    if (!pessoableType) return Promise.resolve(null);

    const mixinMethodName = `get${uppercaseFirst(pessoableType)}`;
    console.log(`get${uppercaseFirst(pessoableType)}`);
    return this[mixinMethodName](option);
  }

  static associate(models) {
    this.belongsToMany(models.Vinculo, {
      through: models.PessoaVinculo,
      as: { singular: 'vinculo', plural: 'vinculos' },
      foreignKey: 'pessoaid',
      otherKey: 'vinculoid',
    });

    this.belongsToMany(models.Contrato, {
      through: models.AssociadoPJ,
      as: { singular: 'contratopj', plural: 'contratospj' },
      foreignKey: 'responsavelfinanceiroid',
      otherKey: 'id',
    });

    this.hasOne(models.PessoaFisica, {
      foreignKey: 'id',
      otherKey: 'id',
      constraints: false,
      as: 'dadospessoafisica',
    });

    this.hasOne(models.PessoaJuridica, {
      foreignKey: 'id',
      otherKey: 'id',
      constraints: false,
      as: 'dadospessoajuridica',
    });

    this.hasMany(models.Telefone, {
      foreignKey: 'dadosid',
      as: {
        singular: 'telefone',
        plural: 'telefones',
      },
    });

    this.hasMany(models.Endereco, {
      foreignKey: 'dadosid',
      as: {
        singular: 'endereco',
        plural: 'enderecos',
      },
    });

    this.hasMany(models.Email, {
      foreignKey: 'dadosid',
      as: {
        plural: 'emails',
        singular: 'email',
      },
    });

    this.hasMany(models.Beneficiario, {
      foreignKey: 'pessoabeneficiarioid',
      as: {
        plural: 'beneficiarios',
        singular: 'beneficiario',
      },
    });

    this.belongsToMany(models.GrupoFamiliar, {
      through: models.Beneficiario,
      foreignKey: 'pessoabeneficiarioid',
      otherKey: 'grupofamiliarid',
      as: 'grupofamiliar',
    });

    // this.hasMany(models.CentroCusto, {
    //   foreignKey: 'empresaid',
    //   as: {
    //     singular: 'centrocusto',
    //     plural: 'centrocustos',
    //   },
    // });
  }
}
