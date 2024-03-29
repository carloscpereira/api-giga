/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Contrato extends Model {
    static init(sequelize) {
        super.init({
            numerocontrato: Sequelize.STRING,
            numeroproposta: Sequelize.STRING,
            operadoraid: Sequelize.BIGINT,
            statusid: Sequelize.BIGINT,
            status: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoStatus ? this.infoStatus.descricao : undefined;
                },
            },
            valor: {
                type: Sequelize.VIRTUAL,
                get() {
                    if (this.gruposfamiliar && this.gruposfamiliar.length > 0) {
                        if (this.gruposfamiliar[0].beneficiarios) {
                            return this.gruposfamiliar[0].beneficiarios
                                .filter((ben) => ben.dados.ativo === '1')
                                .reduce((old, current) => {
                                    console.log('entrei aqui');
                                    console.log(current);
                                    return old + (current.dados.valor - current.dados.descontovalor);
                                }, 0);
                        }
                    }

                    return 0;
                },
            },
            dataadesao: Sequelize.DATE,
            datacancelamento: Sequelize.DATE,
            dataregistrosistema: Sequelize.DATE,
            datalimitecancelamento: Sequelize.DATE,
            datainicialvigencia: Sequelize.DATE,
            datafinalvigencia: Sequelize.DATE,
            ciclovigenciacontrato: Sequelize.INTEGER,
            quantidademesesvigencia: Sequelize.INTEGER,
            temporeativacao: Sequelize.DATE,
            prazolimitebloqueio: Sequelize.INTEGER,
            obs: Sequelize.STRING,
            tipocontratoid: Sequelize.INTEGER,
            tipocontrato: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoContrato ? this.infoContrato.descricao : undefined;
                },
            },
            tipotabelausoid: Sequelize.INTEGER,
            contrato_parent: Sequelize.INTEGER,
            tipotabelauso: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoTabelaUso ? this.infoTabelaUso.descricao : undefined;
                },
            },
            descontotabelauso: Sequelize.DOUBLE,
            chaveex: Sequelize.INTEGER,
            tipodecarteiraid: Sequelize.INTEGER,
            tipodecarteira: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoCarteira ? this.infoCarteira.descricao : undefined;
                },
            },
            databloqueio: Sequelize.DATE,
            motivoadesaoid: Sequelize.INTEGER,
            motivoadesao: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoAdesao ? this.infoAdesao.descricao : undefined;
                },
            },
            motivocancelamentoid: Sequelize.INTEGER,
            motivocancelamento: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoCancelamento ? this.infoCancelamento.descricao : undefined;
                },
            },
            datareativacao: Sequelize.DATE,
            bloqueadopesquisa: Sequelize.BOOLEAN,
            localid: Sequelize.INTEGER,
            con_in_renovacao_auto: Sequelize.BOOLEAN,
            con_dt_geracao_parcelas: Sequelize.DATE,
            con_in_situacao: Sequelize.SMALLINT,
            con_id_regra_vigencia: Sequelize.INTEGER,
            importado: Sequelize.CHAR,
            con_nu_prazo_cancela_inad: Sequelize.INTEGER,
            tipodecarteiracontratoid: Sequelize.INTEGER,
            id_gld: Sequelize.INTEGER,
            centrocustoid: Sequelize.BIGINT,
            cartaoid: Sequelize.INTEGER,
        }, {
            sequelize,
            tableName: 'cn_contrato',
            scopes: {
                pessoaFisica: {
                    where: {
                        tipocontratoid: 5,
                    },
                },
            },
        });

        return this;
    }

    static associate(models) {
        this.hasMany(models.Titulo, {
            foreignKey: 'numerocontratoid',
            as: { sigle: 'titulo', plural: 'titulos' },
        });

        this.belongsTo(models.TipoContrato, {
            foreignKey: 'tipocontratoid',
            as: 'infoContrato',
        });

        this.belongsToMany(models.Pessoa, {
            through: models.AssociadoPJ,
            foreignKey: 'id',
            otherKey: 'responsavelfinanceiroid',
            constraints: false,
            as: 'responsavelpj',
        });

        this.belongsToMany(models.PessoaJuridica, {
            through: models.AssociadoPJ,
            foreignKey: 'id',
            otherKey: 'responsavelfinanceiroid',
            constraints: false,
            as: 'responsavel_pessoajuridica',
        });

        this.belongsToMany(models.Pessoa, {
            through: models.AssociadoPF,
            foreignKey: 'id',
            otherKey: 'responsavelfinanceiroid',
            constraints: false,
            as: 'responsavelpf',
        });

        this.belongsToMany(models.PessoaFisica, {
            through: models.AssociadoPF,
            foreignKey: 'id',
            otherKey: 'responsavelfinanceiroid',
            constraints: false,
            as: 'responsavel_pessoafisica',
        });

        this.belongsTo(models.AssociadoPF, {
            foreignKey: 'id',
            otherKey: 'id',
            as: 'associado_pf',
        });

        this.belongsToMany(models.Especialidade, {
            through: models.EspecialidadeClinica,
            foreignKey: 'numerocontrato',
            otherKey: 'especialidadeid',
            as: 'especialidades_clinica',
        });

        this.hasMany(models.GrupoFamiliar, {
            foreignKey: 'contratoid',
            as: {
                plural: 'gruposfamiliar',
                singular: 'grupofamiliar',
            },
        });

        this.hasMany(models.Beneficiario, {
            foreignKey: 'contratoid',
            as: {
                plural: 'beneficiarios',
                singular: 'beneficiario',
            },
        });

        this.belongsTo(models.PessoaJuridica, {
            foreignKey: 'operadoraid',
            as: 'operadora',
        });

        this.belongsTo(models.TipoCarteira, {
            foreignKey: 'tipodecarteiraid',
            as: 'infoCarteira',
        });

        this.belongsTo(models.Status, {
            foreignKey: 'statusid',
            as: 'infoStatus',
        });

        this.belongsTo(models.TipoTabelaUso, {
            foreignKey: 'tipotabelausoid',
            as: 'infoTabelaUso',
        });

        this.belongsTo(models.TipoOcorrencia, {
            foreignKey: 'motivoadesaoid',
            as: 'infoAdesao',
        });

        this.belongsTo(models.TipoOcorrencia, {
            foreignKey: 'motivocancelamentoid',
            as: 'infoCancelamento',
        });

        this.hasOne(models.DentistaPF, {
            foreignKey: 'id',
            as: 'dentista',
        });

        this.belongsTo(models.CartaoCredito, {
            foreignKey: 'cartaoid',
            as: 'cartao',
        });
    }
}