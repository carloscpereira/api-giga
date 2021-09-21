require('dotenv/config');

module.exports = {
    development: {
        databases: {
            atemde: {
                dialect: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: 'mypass',
                database: 'atemde',
                omitNull: false,
                benchmark: true,
                define: {
                    timestamps: false,
                    underscore: true,
                    underscoreAll: true,
                },
            },
            idental: {
                dialect: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: 'mypass',
                database: 'atemde',
                omitNull: false,
                benchmark: true,
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
                port: process.env.DB_PORT_ATEMDE,
                omitNull: false,
                benchmark: true,
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
                port: process.env.DB_PORT_IDENTAL,
                omitNull: false,
                benchmark: true,
                define: {
                    timestamps: false,
                    underscore: true,
                    underscoreAll: true,
                },
            },

            homolog: {
                dialect: process.env.DB_DIALECT_HOMOLOG || 'postgres',
                host: process.env.DB_HOST_HOMOLOG || 'localhost',
                username: process.env.DB_USER_HOMOLOG || 'postgres',
                password: process.env.DB_PASS_HOMOLOG,
                database: process.env.DB_DATABASE_HOMOLOG,
                port: process.env.DB_PORT_HOMOLOG,
                omitNull: false,
                benchmark: true,
                define: {
                    timestamps: false,
                    underscore: true,
                    underscoreAll: true,
                },
            },
        },
    },
};
