import * as Yup from 'yup';
import pool from '../../utils/Database';
import knex from '../../utils/Knex';
import connectionConfig from '../../config/database';
import Database from '../../database';

export default async(req, res, next) => {
    const schema = Yup.object().shape({
        operator: Yup.string()
            .lowercase()
            .matches(/(atemde|idental|homolog)/)
            .required(),
    });

    if (!(await schema.isValid(req.params))) {
        try {
            await schema.validate(req.params);
        } catch (err) {
            return res.status(401).json({
                error: 401,
                data: {
                    message: 'Operator is required, and must be between atemde e idental',
                    errors: err.errors,
                },
            });
        }
    }

    const { operator } = req.params;

    req.connection = connectionConfig[process.env.NODE_ENV].databases[operator];

    // eslint-disable-next-line no-new
    req.sequelize = new Database(req.connection).connection;

    req.pool = pool[operator];
    req.knex = knex[operator];

    return next();
};
