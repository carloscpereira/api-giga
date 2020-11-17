import 'dotenv/config';

import { resolve } from 'path';
import express from 'express';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import queryParams from 'express-query-params';
import cors from 'cors';

// Swagger
import swaggerUi from 'swagger-ui-express';

import 'express-async-errors';

import routes from './routes';

import sentryConfig from './config/sentry';
import corsConfig from './config/cors';

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
    this.server.use(
      '/documentation',
      async (req, res, next) => {
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
    this.server.use(async (err, req, res, next) => {
      console.log(err);
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
      // if (process.env.NODE_ENV !== 'production') return res.status(500).json(errors);

      // return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
    });
  }
}

export default new App().server;
