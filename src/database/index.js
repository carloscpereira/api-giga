import Sequelize from 'sequelize';

import Parcela from '../app/models/Sequelize/Parcela';

// import databaseConfig from '../config/database';

const models = [Parcela];

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
