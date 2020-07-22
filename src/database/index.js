import Sequelize from 'sequelize';

import Parcela from '../app/models/Sequelize/Parcela';
import FormaPagamento from '../app/models/Sequelize/FormaPagamento';
import Titulo from '../app/models/Sequelize/Titulo';
import Contrato from '../app/models/Sequelize/Contrato';
import Documento from '../app/models/Sequelize/Documento';
import LogCartaoCredito from '../app/models/Sequelize/LogCartaoCredito';

// import databaseConfig from '../config/database';

const models = [
  Parcela,
  FormaPagamento,
  Titulo,
  Contrato,
  Documento,
  LogCartaoCredito,
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
