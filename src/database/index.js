const Sequelize = require('sequelize');

require('dotenv/config');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

const databases = Object.keys(config.databases);

const modelsAtemde = [];
const modelsIdental = [];

// Init Sequelize on all databases

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = {};

    for (let i = 0; i < databases.length; i += 1) {
      const database = databases[i];
      const dbPath = config.databases[database];

      this.connection[database] = new Sequelize(
        dbPath.database,
        dbPath.username,
        dbPath.password,
        dbPath
      );
    }

    modelsAtemde
      .map((model) => model.init(this.connection.atemde))
      .map(
        (model) =>
          model.associate && model.associate(this.connection.atemde.models)
      );
    modelsIdental
      .map((model) => model.init(this.connection.idental))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
