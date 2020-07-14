/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
// import Sequelize from 'sequelize';
// import { resolve } from 'path';
const { Pool } = require('pg');
// import databaseConfig from '../config/database';

require('dotenv/config');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

console.log(env);

const db = {};

const databases = Object.keys(config.databases);

for (let i = 0; i < databases.length; i += 1) {
  const database = databases[i];
  const dbPath = config.databases[database];

  db[database] = new Pool({
    host: dbPath.host,
    user: dbPath.username,
    port: dbPath.port,
    password: dbPath.password,
    database: dbPath.database,
    charset: 'utf8',
  });
}

module.exports = db;
