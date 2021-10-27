/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Plano extends Model {
    static init(sequelize) {
        super.init({
            id: { type: Sequelize.BIGINT, primaryKey: true },
            descricao: Sequelize.STRING,
            codigo: Sequelize.INTEGER,
            tipopessoa: Sequelize.CHAR,
            pla_in_anterior_lei: Sequelize.BOOLEAN,
        }, {
            sequelize,
            tableName: 'cn_plano',
        });

        return this;
    }
}
