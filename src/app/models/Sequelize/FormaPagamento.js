/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class FormaPagamento extends Model {
  static init(sequelize) {
    super.init(
      {
        parcelaid: Sequelize.INTEGER,
        agenciaid: Sequelize.INTEGER,
        contaid: Sequelize.INTEGER,
        numerocheque: Sequelize.STRING,
        numerocartao: Sequelize.STRING,
        numerodocumento: Sequelize.STRING,
        numeromatricula: Sequelize.STRING,
        numerotransacao: Sequelize.STRING,
        validadecartao: Sequelize.STRING,
        tipodecarteiraid: Sequelize.INTEGER,
        numeroempresa: Sequelize.STRING,
        tipocartaoid: Sequelize.INTEGER,
        obs: Sequelize.STRING,
        numeroboleto: Sequelize.STRING,
        codigosegurancacartao: Sequelize.STRING,
        valor: Sequelize.DOUBLE,
        centrocustoid: Sequelize.INTEGER,
        nome_emitente: Sequelize.STRING,
        contacheque: Sequelize.STRING,
        fop_in_conciliado: Sequelize.BOOLEAN,
        fop_in_pre_conciliacao: Sequelize.BOOLEAN,
        che_id_cheque: Sequelize.INTEGER,
        paymentid: Sequelize.STRING,
        tid: Sequelize.STRING,
      },
      { sequelize, tableName: 'formapagamento' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Parcela, { foreignKey: 'parcelaid', as: 'parcela' });
  }
}
