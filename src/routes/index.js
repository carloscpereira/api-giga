/* eslint-disable import/prefer-default-export */
import { Router } from 'express';

import parcelaRouter from './_parcelaRouter';
import ocorrenciaRouter from './_ocorrenciaRouter';
import loteRouter from './_loteRouter';
import logCartaoCreditoRouter from './_logCartaoCreditoRouter';
import contratoRouter from './_contratoRouter';
import modalidadePagamentoRouter from './_modalidadePagamentoRouter';
import tipoCarteiraRouter from './_tipoCarteiraRouter';
import pessoaRouter from './_pessoaRouter';
import pessoaJuridicaRouter from './_pessoaJuridicaRouter';
import pessoaFisicaRouter from './_pessoaFisicaRouter';
import logContatoRouter from './_logContatoRouter';
import boletoRouter from './_boletoRouter';
import redeCredenciadaRouter from './_redeCrededenciadaRouter';

import { checkAuthorization } from '../app/middlewares';

const routes = Router();

routes.use('/rede-credenciada', redeCredenciadaRouter);

routes.use(checkAuthorization);
routes.use('/parcelas/log/cartao-credito', logCartaoCreditoRouter);
routes.use('/ocorrencias', ocorrenciaRouter);
routes.use('/lotes', loteRouter);
routes.use('/parcelas', parcelaRouter);
routes.use('/contratos', contratoRouter);
routes.use('/modalidade-pagamentos', modalidadePagamentoRouter);
routes.use('/tipo-carteira', tipoCarteiraRouter);
routes.use('/pessoa-juridica', pessoaJuridicaRouter);
routes.use('/pessoa', pessoaRouter);
routes.use('/pessoa-fisica', pessoaFisicaRouter);
routes.use('/system/log/contato', logContatoRouter);
routes.use('/parcelas', boletoRouter);

export default routes;
