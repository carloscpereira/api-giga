import 'dotenv/config';

import express from 'express';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import queryParams from 'express-query-params';

import 'express-async-errors';

// import routes from './routes/index2';
import {
  parcelaRouter,
  loteRouter,
  ocorrenciaRouter,
  logCartaoCreditoRouter,
} from './routes';
import sentryConfig from './config/sentry';
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
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      queryParams({
        format: 'sql',
        blacklistParams: ['limit', 'order', 'page', 'perPage'],
      })
    );
  }

  routes() {
    this.server.use('/parcelas/log/cartao-credito', logCartaoCreditoRouter);
    this.server.use('/ocorrencias', ocorrenciaRouter);
    this.server.use('/lotes', loteRouter);
    this.server.use('/parcelas', parcelaRouter);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
