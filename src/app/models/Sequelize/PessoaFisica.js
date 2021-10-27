/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class PessoaFisica extends Model {
    static init(sequelize) {
        super.init({
            id: { type: Sequelize.BIGINT, primaryKey: true },
            tipodadosid: Sequelize.BIGINT,
            status: Sequelize.CHAR,
            usuario: Sequelize.CHAR,
            datacadastro: Sequelize.DATE,
            nome: Sequelize.STRING,
            rg: Sequelize.STRING,
            cpf: Sequelize.STRING,
            datanascimento: Sequelize.DATE,
            sexo: Sequelize.CHAR,
            estadocivilid: Sequelize.BIGINT,
            secretariaid: Sequelize.BIGINT,
            orgaoemissor: Sequelize.CHAR,
            nomedamae: Sequelize.STRING,
            nacionalidade: Sequelize.STRING,
            dataalteracao: Sequelize.DATE,
        }, {
            sequelize,
            tableName: 'sp_dadospessoafisica',
            timestamps: true,
            createdAt: 'datacadastro',
            updatedAt: 'dataalteracao',
        });

        return this;
    }

    static associate(models) {
        this.belongsToMany(models.Contrato, {
            through: models.AssociadoPF,
            as: { singular: 'contrato', plural: 'contratos' },
            foreignKey: 'responsavelfinanceiroid',
            otherKey: 'id',
        });

        this.belongsTo(models.Pessoa, {
            as: 'pessoa',
            foreignKey: 'id',
            constraints: false,
        });

        this.belongsTo(models.EstadoCivil, {
            foreignKey: 'estadocivilid',
            as: 'estadocivil',
        });

        this.belongsToMany(models.GrupoFamiliar, {
            through: models.Beneficiario,
            foreignKey: 'pessoabeneficiarioid',
            otherKey: 'grupofamiliarid',
            as: 'gruposfamiliar',
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

        this.hasMany(models.CartaoCredito, {
            foreignKey: 'pessoaid',
            as: {
                plural: 'cartoes',
                singular: 'cartao',
            },
        });

        this.hasMany(models.Conta, {
            foreignKey: 'pessoaid',
            as: {
                plural: 'contas',
                singular: 'conta',
            },
        });
        this.belongsToMany(models.Vinculo, {
            through: models.PessoaVinculo,
            as: { singular: 'vinculo', plural: 'vinculos' },
            foreignKey: 'pessoaid',
            otherKey: 'vinculoid',
        });
    }
}