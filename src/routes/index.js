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
// import boletoRouter from './_boletoRouter';
import redeCredenciadaRouter from './_redeCrededenciadaRouter';
import vinculoRouter from './_vinculoRouter';
import centroCustoRouter from './_centroCustoRouter';
import agenciaRouter from './_agenciaRouter';
import bancoRouter from './_bancoRouter';
import departamentoRouter from './_departamentoRouter';
import setorRouter from './_setorRouter';
import produtoRouter from './_produtoRouter';
import planoRouter from './_planoRouter';
import versaoPlanoRouter from './_versaoPlanoRouter';
import areaCoberturaRouter from './_areaCoberturaRouter';
import participacaoFinanceiraRouter from './_participacaoFinanceiraRouter';
import regraVigenciaRouter from './_regraVigenciaRouter';
import tipoAreaAbrangenciaRouter from './_tipoAreaAbrangenciaRouter';
import tipoContratacaoRouter from './_tipoContratacaoRouter';
import tipoContratoRouter from './_tipoContratoRouter';
import estadoCivilRouter from './_estadoCivilRouter';
import vendedorRouter from './_vendedorRouter';
import corretoraRouter from './_corretoraRouter';
import regraFechamentoRouter from './_regraFechamentoRouter';
import tipoCartaoRouter from './_tipoCartaoRouter';
import testeRouter from './_testeRouter';
import cmfRouter from './_centroMovimentacaoFinanceiraRouter';
import gcmfRouter from './_grupoCentroMovimentacaoFinanceiraRouter';
import usuarioRouter from './_usuarioRouter';
import fichaMedicaRouter from './_fichaMedicaRouter';

import { checkAuthorization } from '../app/middlewares';

const routes = Router();

routes.use('/redes-credenciadas', redeCredenciadaRouter);

routes.use('/teste', testeRouter);

if (process.env.NODE_ENV !== 'development') routes.use(checkAuthorization);
routes.use('/parcelas/log/cartao-credito', logCartaoCreditoRouter);
routes.use('/ocorrencias', ocorrenciaRouter);
routes.use('/lotes', loteRouter);
routes.use('/parcelas', parcelaRouter);
routes.use('/contratos', contratoRouter);
routes.use('/modalidade-pagamentos', modalidadePagamentoRouter);
routes.use('/tipos-carteiras', tipoCarteiraRouter);
routes.use('/pessoa-juridica', pessoaJuridicaRouter);
routes.use('/pessoa', pessoaRouter);
routes.use('/pessoa-fisica', pessoaFisicaRouter);
routes.use('/system/log/contato', logContatoRouter);
routes.use('/vinculos', vinculoRouter);
routes.use('/centro-resultados', centroCustoRouter);
routes.use('/bancos', bancoRouter);
routes.use('/agencias', agenciaRouter);
routes.use('/departamentos', departamentoRouter);
routes.use('/produtos', produtoRouter);
routes.use('/setores', setorRouter);
routes.use('/planos', planoRouter);
routes.use('/versoes-planos', versaoPlanoRouter);
routes.use('/participacao-financeira', participacaoFinanceiraRouter);
routes.use('/regras-vigencias', regraVigenciaRouter);
routes.use('/areas-cobertura', areaCoberturaRouter);
routes.use('/tipos-area-abrangencia', tipoAreaAbrangenciaRouter);
routes.use('/tipos-contratacoes', tipoContratacaoRouter);
routes.use('/tipos-contratos', tipoContratoRouter);
routes.use('/tipos-cartoes', tipoCartaoRouter);
routes.use('/estado-civil', estadoCivilRouter);
routes.use('/vendedores', vendedorRouter);
routes.use('/corretoras', corretoraRouter);
routes.use('/regras-fechamento', regraFechamentoRouter);
routes.use('/cmf', cmfRouter);
routes.use('/grupocmf', gcmfRouter);
routes.use('/usuario', usuarioRouter);
routes.use('/ficha-medica', fichaMedicaRouter);

export default routes;
