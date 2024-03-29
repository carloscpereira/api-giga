import Sequelize from 'sequelize';

import Parcela from '../app/models/Sequelize/Parcela';
import FormaPagamento from '../app/models/Sequelize/FormaPagamento';
import Titulo from '../app/models/Sequelize/Titulo';
import Contrato from '../app/models/Sequelize/Contrato';
import Documento from '../app/models/Sequelize/Documento';
import LogCartaoCredito from '../app/models/Sequelize/LogCartaoCredito';
import Ocorrencia from '../app/models/Sequelize/Ocorrencia';
import LotePagamento from '../app/models/Sequelize/LotePagamento';
import ParcelaLote from '../app/models/Sequelize/ParcelaLote';
import ParcelaAcrescimoDesconto from '../app/models/Sequelize/ParcelaAcrescimoDesconto';
import ModalidadePagamento from '../app/models/Sequelize/ModalidadePagamento';
import TipoCarteira from '../app/models/Sequelize/TipoCarteira';
// import TipoContrato from '../app/models/Sequelize/TipoContrato';

import Pessoa from '../app/models/Sequelize/Pessoa';
import Vinculo from '../app/models/Sequelize/Vinculo';
import PessoaVinculo from '../app/models/Sequelize/PessoaVinculo';
import PessoaFisica from '../app/models/Sequelize/PessoaFisica';
import PessoaJuridica from '../app/models/Sequelize/PessoaJuridica';

import Email from '../app/models/Sequelize/Email';
import Endereco from '../app/models/Sequelize/Endereco';
import Telefone from '../app/models/Sequelize/Telefone';
import TipoContrato from '../app/models/Sequelize/TipoContrato';
import AssociadoPF from '../app/models/Sequelize/AssociadoPF';
import AssociadoPJ from '../app/models/Sequelize/AssociadoPJ';
import EstadoCivil from '../app/models/Sequelize/EstadoCivil';
import ModalidadeCobranca from '../app/models/Sequelize/ModalidadeCobranca';

import LogContato from '../app/models/Sequelize/LogContato';

import Beneficiario from '../app/models/Sequelize/Beneficiario';
import GrupoFamiliar from '../app/models/Sequelize/GrupoFamiliar';
import AtributoVinculo from '../app/models/Sequelize/AtributoVinculo';
import Plano from '../app/models/Sequelize/Plano';
import CentroCusto from '../app/models/Sequelize/CentroCusto';
import Setor from '../app/models/Sequelize/Setor';
import Departamento from '../app/models/Sequelize/Departamento';
import Banco from '../app/models/Sequelize/Banco';
import Agencia from '../app/models/Sequelize/Agencia';
import AreaCobertura from '../app/models/Sequelize/AreaCobertura';
import ParticipacaoFinanceira from '../app/models/Sequelize/ParticipacaoFinanceira';
import Produto from '../app/models/Sequelize/Produto';
import SegmentacaoAssistencial from '../app/models/Sequelize/SegmentacaoAssistencial';
import TipoAreaAbrangencia from '../app/models/Sequelize/TipoAreaAbrangencia';
import TipoContratacao from '../app/models/Sequelize/TipoContratacao';
import VersaoPlano from '../app/models/Sequelize/VersaoPlano';
import RegraVigenciaContrato from '../app/models/Sequelize/RegraVigenciaContrato';
import Status from '../app/models/Sequelize/Status';
import TipoTabelaUso from '../app/models/Sequelize/TipoTabelaUso';
import TipoOcorrencia from '../app/models/Sequelize/TipoOcorrencia';
import TipoBeneficiario from '../app/models/Sequelize/TipoBeneficiario';
import TipoContratoVinculo from '../app/models/Sequelize/TipoContratoVinculo';
import TipoContratoPessoa from '../app/models/Sequelize/TipoContratoPessoa';
import PessoaOrganograma from '../app/models/Sequelize/PessoaOrganograma';
import Conta from '../app/models/Sequelize/Conta';
import CartaoCredito from '../app/models/Sequelize/CartaoCredito';
import Cidade from '../app/models/Sequelize/Cidade';
import Estado from '../app/models/Sequelize/Estado';
import Bairro from '../app/models/Sequelize/Bairro';
import RegraFechamento from '../app/models/Sequelize/RegraFechamento';
import TipoBaixa from '../app/models/Sequelize/TipoBaixa';
import CentroMovimentacaoFinanceira from '../app/models/Sequelize/CentroMovimentacaoFinanceira';
import DentistaPF from '../app/models/Sequelize/DentistaPF';
import RegraFaturamento from '../app/models/Sequelize/RegraFaturamento';
import Procedimento from '../app/models/Sequelize/Procedimento';
import Localidade from '../app/models/Sequelize/Localidade';
import EspecialidadeClinica from '../app/models/Sequelize/EspecialidadeClinica';
import Especialidade from '../app/models/Sequelize/Especialidade';
import EspecialidadeDentista from '../app/models/Sequelize/EspecialidadeDentista';
import RolCoberturaPlanoProcedimento from '../app/models/Sequelize/RolCoberturaPlanoProcedimento';
import RolCoberturaPlano from '../app/models/Sequelize/RolCoberturaPlano';
import TipoCartao from '../app/models/Sequelize/TipoCartao';
import GrupoCentroMovimentacaoFinanceira from '../app/models/Sequelize/GrupoCentroMovimentacaoFinanceira';
// import databaseConfig from '../config/database';

const models = [
  Parcela,
  FormaPagamento,
  Titulo,
  Contrato,
  Documento,
  LogCartaoCredito,
  Ocorrencia,
  LotePagamento,
  ParcelaLote,
  ModalidadePagamento,
  ParcelaAcrescimoDesconto,
  TipoCarteira,
  Pessoa,
  Vinculo,
  PessoaVinculo,
  PessoaFisica,
  PessoaJuridica,
  Email,
  Endereco,
  Telefone,
  TipoContrato,
  AssociadoPF,
  AssociadoPJ,
  EstadoCivil,
  LogContato,
  ModalidadeCobranca,
  Beneficiario,
  GrupoFamiliar,
  Plano,
  AtributoVinculo,
  CentroCusto,
  Setor,
  Departamento,
  Banco,
  Agencia,
  AreaCobertura,
  ParticipacaoFinanceira,
  Produto,
  SegmentacaoAssistencial,
  TipoAreaAbrangencia,
  TipoContratacao,
  VersaoPlano,
  RegraVigenciaContrato,
  Status,
  TipoTabelaUso,
  TipoOcorrencia,
  TipoBeneficiario,
  TipoContratoVinculo,
  TipoContratoPessoa,
  PessoaOrganograma,
  CartaoCredito,
  Conta,
  Cidade,
  Estado,
  Bairro,
  RegraFechamento,
  TipoBaixa,
  CentroMovimentacaoFinanceira,
  DentistaPF,
  RegraFaturamento,
  Procedimento,
  Localidade,
  EspecialidadeClinica,
  Especialidade,
  EspecialidadeDentista,
  RolCoberturaPlanoProcedimento,
  RolCoberturaPlano,
  TipoCartao,
  GrupoCentroMovimentacaoFinanceira,
];

class Database {
  constructor(config) {
    // this.connection = connection;
    this.config = config;
    this.init();
  }

  init() {
    this.connection = new Sequelize({ ...this.config, logging: console.log });

    models
      .map((model) => model.init(this.connection))
      .map((model) => model.associate && model.associate(this.connection.models));
  }
}

export default Database;
