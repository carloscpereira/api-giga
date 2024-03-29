/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class AssociadoPF extends Model {
    static init(sequelize) {
        super.init({
            id: { type: Sequelize.BIGINT, primaryKey: true },
            responsavelfinanceiroid: Sequelize.STRING,
            corretoravendedorid: Sequelize.BIGINT,
            planoid: Sequelize.BIGINT,
            plano: {
                type: Sequelize.VIRTUAL,
                get() {
                    return this.infoPlano ? this.infoPlano.descricao : undefined;
                },
            },
            limitemensalautorizacao: Sequelize.INTEGER,
            versaoplanoid: Sequelize.BIGINT,
            valorcontrato: Sequelize.BIGINT,
            datavencimento: Sequelize.BIGINT,
            diavencimento: Sequelize.BOOLEAN,
            sequencia: Sequelize.INTEGER,
            carteirausuarioparceriaid: Sequelize.STRING,
            carteiraantecipada: Sequelize.STRING,
            tipocarteiraid: Sequelize.STRING,
            sequenciaboleto: Sequelize.STRING,
            corretora: Sequelize.STRING,
            uso: Sequelize.STRING,
            valormes: Sequelize.STRING,
            valorliquido: Sequelize.STRING,
            valordesconto: Sequelize.STRING,
            qtdparcela: Sequelize.STRING,
        }, { sequelize, tableName: 'cn_associadopf' });

        return this;
    }

    static associate(models) {
        this.belongsTo(models.PessoaFisica, {
            foreignKey: 'responsavelfinanceiroid',
            as: 'pessoa_fisica',
        });

        this.belongsTo(models.Plano, {
            foreignKey: 'planoid',
            as: 'infoPlano',
        });
    }
}
