const Knex = require('knex');

require('dotenv/config');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

const db = {};

const databases = Object.keys(config.databases);

for (let i = 0; i < databases.length; i += 1) {
  const database = databases[i];
  const dbPath = config.databases[database];

  db[database] = new Knex({
    client: dbPath.dialect === 'postgres' ? 'pg' : dbPath.dialect,
    connection: {
      host: dbPath.host,
      user: dbPath.username,
      password: dbPath.password,
      database: dbPath.database,
      port: dbPath.port,
      charset: 'utf8',
    },
  });
}

module.exports = db;
