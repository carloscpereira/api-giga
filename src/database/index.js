import Sequelize from 'sequelize';

import Parcela from '../app/models/Sequelize/Parcela';
import FormaPagamento from '../app/models/Sequelize/FormaPagamento';
import Titulo from '../app/models/Sequelize/Titulo';
import Contrato from '../app/models/Sequelize/Contrato';
import Documento from '../app/models/Sequelize/Documento';
import LogCartaoCredito from '../app/models/Sequelize/LogCartaoCredito';
import Ocorrencia from '../app/models/Sequelize/Ocorrencia';
import LotePagamento from '../app/models/Sequelize/LotePagamento';
import ParcelaLote from '../app/models/Sequelize/ParcelaLote';

// import databaseConfig from '../config/database';

const models = [
  Parcela,
  FormaPagamento,
  Titulo,
  Contrato,
  Documento,
  LogCartaoCredito,
  Ocorrencia,
  LotePagamento,
  ParcelaLote,
];

class Database {
  constructor(config) {
    // this.connection = connection;
    this.config = config;
    this.init();
  }

  init() {
    this.connection = new Sequelize(this.config);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default Database;
