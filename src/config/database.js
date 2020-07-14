require('dotenv/config');

module.exports = {
  development: {
    databases: {
      atemde: {
        dialect: 'postgres',
        host: 'localhost',
        username: 'postgres',
        password: 'mypass',
        database: 'atemde',
        define: {
          timestamps: false,
          underscore: true,
          underscoreAll: true,
        },
      },

      idental: {
        dialect: 'postgres',
        host: 'localhost',
        username: 'postgres',
        password: 'mypass',
        database: 'atemde',
        define: {
          timestamps: false,
          underscore: true,
          underscoreAll: true,
        },
      },
    },
  },
  production: {
    databases: {
      atemde: {
        dialect: process.env.DB_DIALECT_ATEMDE || 'postgres',
        host: process.env.DB_HOST_ATEMDE || 'localhost',
        username: process.env.DB_USER_ATEMDE || 'postgres',
        password: process.env.DB_PASS_ATEMDE,
        database: process.env.DB_DATABASE_ATEMDE,
        define: {
          timestamps: false,
          underscore: true,
          underscoreAll: true,
        },
      },

      idental: {
        dialect: process.env.DB_DIALECT_IDENTAL || 'postgres',
        host: process.env.DB_HOST_IDENTAL || 'localhost',
        username: process.env.DB_USER_IDENTAL || 'postgres',
        password: process.env.DB_PASS_IDENTAL,
        database: process.env.DB_DATABASE_IDENTAL,
        define: {
          timestamps: false,
          underscore: true,
          underscoreAll: true,
        },
      },
    },
  },
};
