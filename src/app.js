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

import { checkAuthorization } from './app/middlewares';

import {
  parcelaRouter,
  loteRouter,
  ocorrenciaRouter,
  logCartaoCreditoRouter,
  contratoRouter,
  modalidadePagamentoRouter,
  tipoCarteiraRouter,
} from './routes';

import sentryConfig from './config/sentry';
import corsConfig from './config/cors';

const YAML = require('yamljs');

const swaggerDocument = YAML.load(
  resolve(__dirname, '..', 'swagger', 'swagger.yaml')
);
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
    this.server.use(checkAuthorization);
    this.server.use(
      queryParams({
        format: 'sql',
        blacklistParams: ['limit', 'page', 'perPage'],
      })
    );
  }

  routes() {
    this.server.use('/parcelas/log/cartao-credito', logCartaoCreditoRouter);
    this.server.use('/ocorrencias', ocorrenciaRouter);
    this.server.use('/lotes', loteRouter);
    this.server.use('/parcelas', parcelaRouter);
    this.server.use('/contratos', contratoRouter);
    this.server.use('/modalidade-pagamentos', modalidadePagamentoRouter);
    this.server.use('/tipo-carteira', tipoCarteiraRouter);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      console.log(err);
      const errors = await new Youch(err, req).toJSON();

      if (process.env.NODE_ENV !== 'production')
        return res.status(500).json(errors);

      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal Server Error' } });
    });
  }
}

export default new App().server;
