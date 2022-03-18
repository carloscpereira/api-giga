import 'dotenv/config';

import { resolve } from 'path';
import express from 'express';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import queryParams from 'express-query-params';
import bodyParser from 'body-parser';
import cors from 'cors';

// Swagger
import swaggerUi from 'swagger-ui-express';

import 'express-async-errors';

import { ValidationError } from 'yup';
import routes from './routes';

import sentryConfig from './config/sentry';
import corsConfig from './config/cors';

import AppError from './app/errors/AppError';

const YAML = require('yamljs');

const swaggerDocument = YAML.load(resolve(__dirname, '..', 'swagger', 'swagger.yaml'));
// import './database';

class App {
    constructor() {
        this.server = express();

        Sentry.init(sentryConfig);

        this.middleware();
        this.routes();
        this.exceptionHandler();
    }

    middleware() {
        this.server.use(bodyParser.json({ limit: '50mb' }));
        this.server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.server.use(
            '/documentation',
            async(req, res, next) => {
                swaggerDocument.host = req.get('host');
                req.swaggerDoc = swaggerDocument;
                next();
            },
            swaggerUi.serve,
            swaggerUi.setup()
        );
        this.server.use(cors(corsConfig));
        this.server.use(Sentry.Handlers.requestHandler());
        this.server.use(express.json());
        this.server.use((req, res, next) => {
            req.query = {...req.query, ...(req.query.rf_nome ? { rf_nome: req.query.rf_nome.toUpperCase() } : {}) };
            return next();
        });
        this.server.use(
            queryParams({
                format: 'sql',
                blacklistParams: ['limit', 'page', 'perPage', 'operadora'],
            })
        );
    }

    routes() {
        this.server.use(Sentry.Handlers.errorHandler());
        this.server.use(routes);
    }

    exceptionHandler() {
        this.server.use(async(err, req, res, next) => {
            const errors = await new Youch(err, req).toJSON();

            if (process.env.NODE_ENV !== 'production') return res.status(500).json(errors);

            if (err instanceof AppError) {
                return res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message });
            }
            if (err instanceof ValidationError) {
                return res.status(400).json({ error: 400, message: err.inner, name: 'Validation fails' });
            }
            return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
        });
    }
}

export default new App().server;