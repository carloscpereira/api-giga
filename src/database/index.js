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
];

class Database {
  constructor(config) {
    // this.connection = connection;
    this.config = config;
    this.init();
  }

  init() {
    this.connection = new Sequelize(this.config);

    models
      .map((model) => model.init(this.connection))
      .map((model) => model.associate && model.associate(this.connection.models));
  }
}

export default Database;
