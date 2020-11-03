/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Beneficiario extends Model {
  static init(sequelize) {
    super.init(
      {
        contratoid: Sequelize.BIGINT,
        pessoabeneficiarioid: Sequelize.INTEGER,
        tipobeneficiarioid: Sequelize.INTEGER,
        situacaoinicialid: Sequelize.INTEGER,
        dataregistrosistema: Sequelize.DATE,
        dataadesao: Sequelize.DATE,
        datacompracarencia: Sequelize.DATE,
        numerocarteira: Sequelize.STRING,
        datavalidadecarteira: Sequelize.DATE,
        precoplanoid: Sequelize.BIGINT,
        codigo: Sequelize.INTEGER,
        valor: Sequelize.REAL,
        via: Sequelize.STRING,
        responsavelgrupo: Sequelize.BIGINT,
        ativo: Sequelize.CHAR,
        calculoucomissao: Sequelize.CHAR,
        sequencia: Sequelize.BIGINT,
        datadesativacao: Sequelize.TIME,
        chaveex: Sequelize.BIGINT,
        numdep: Sequelize.BIGINT,
        descontovalor: Sequelize.REAL,
        descontoporcent: Sequelize.REAL,
        exporta: Sequelize.CHAR,
        grupofamiliarid: Sequelize.INTEGER,
        motivoadesaoid: Sequelize.INTEGER,
        motivocancelamentoid: Sequelize.INTEGER,
        codplanoegresso: Sequelize.STRING,
        datareativacaobeneficiario: Sequelize.TIME,
        versaoplano: {
          type: Sequelize.VIRTUAL,
          get() {
            // console.log(this);
            return 1;
          },
        },
        planoid: Sequelize.INTEGER,
        versaoplanoid: Sequelize.INTEGER,
        corretoraid: Sequelize.INTEGER,
        vendedorid: Sequelize.INTEGER,
        tipocarteiraid: Sequelize.INTEGER,
        ben_in_requerente: Sequelize.BOOLEAN,
        ben_in_cobertura_parcial_tmp: Sequelize.BOOLEAN,
        ben_in_proc_excluidos_cob: Sequelize.BOOLEAN,
        importado: Sequelize.CHAR,
        ben_nu_qtd_mes_ativo: Sequelize.INTEGER,
        ben_nu_qtd_ciclo_ativo: Sequelize.INTEGER,
        id_ppr: Sequelize.INTEGER,
      },
      { sequelize, tableName: 'cn_beneficiario' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Plano, {
      foreignKey: 'planoid',
      as: 'plano',
    });

    this.belongsTo(models.VersaoPlano, {
      foreignKey: 'versaoplanoid',
      as: 'versao-plano',
    });

    this.belongsTo(models.Contrato, {
      foreignKey: 'contratoid',
      as: 'contrato',
    });

    this.belongsTo(models.Pessoa, {
      foreignKey: 'pessoabeneficiarioid',
      as: 'pessoa',
    });

    this.belongsTo(models.GrupoFamiliar, {
      foreignKey: 'grupofamiliarid',
      as: 'grupofamiliar',
    });
  }
}
