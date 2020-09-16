/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class ModalidadeCobranca extends Model {
  static init(sequelize) {
    super.init(
      {
        prazoremessa: Sequelize.STRING,
        prazoretorno: Sequelize.STRING,
        tarifa: Sequelize.DOUBLE,
        local: Sequelize.STRING,
        nome: Sequelize.STRING,
        extensao: Sequelize.STRING,
        layoult: Sequelize.STRING,
        modalidadedeenvio: Sequelize.INTEGER,
        descricao: Sequelize.STRING,
        ultimoarquivogravado: Sequelize.STRING,
        localarquivoretorno: Sequelize.STRING,
        extensaoarquivoretorno: Sequelize.STRING,
        nomearquivoretorno: Sequelize.STRING,
        contaid: Sequelize.INTEGER,
        pessoaempresaid: Sequelize.INTEGER,
        tipodecarteiracobrancaid: Sequelize.INTEGER,
        numerodocontrato: Sequelize.STRING,
        dataimplantacao: Sequelize.DATE,
        tipodemovimento: Sequelize.STRING,
        taxaemissaoboleto: Sequelize.DOUBLE,
        instrucoesboleto: Sequelize.STRING,
        localpgtoboleto: Sequelize.STRING,
        codigocedente: Sequelize.STRING,
        dvcodigocedente: Sequelize.STRING,
        numerodoconvenio: Sequelize.STRING,
        url_remessa: Sequelize.STRING,
        moc_in_concilia_auto: Sequelize.BOOLEAN,
      },
      { sequelize, tableName: 'modalidadecobranca' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.TipoCarteira, {
      foreignKey: 'tipodecarteiracobrancaid',
      as: 'carteira',
    });
  }
}
