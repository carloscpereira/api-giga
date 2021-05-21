import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const telefoneSchema = Yup.object().shape({
      Numero: Yup.string(),
      Ramal: Yup.number().integer(),
      TipoTelefone: Yup.number().integer(),
      Principal: Yup.boolean(),
    });

    const emailSchema = Yup.object().shape({
      Email: Yup.string(),
      TipoEmail: Yup.number().integer(),
      Principal: Yup.boolean(),
    });

    const enderecoSchema = Yup.object().shape({
      Logradouro: Yup.string(),
      Bairro: Yup.string(),
      Cidade: Yup.string(),
      Estado: Yup.string(),
      Cep: Yup.string(),
      Complemento: Yup.string(),
      Numero: Yup.string(),
      Principal: Yup.boolean(),
      Telefones: Yup.array().ensure().compact().of(telefoneSchema),
    });

    const beneficiarioSchema = Yup.object().shape({
      Nome: Yup.string().transform(function transformValue(value) {
        return this.isType(value) && value !== null ? value.toUpperCase() : value;
      }),
      Produto: Yup.number(),
      Vinculo: Yup.string().required(),
      Valor: Yup.number(),
      Titular: Yup.boolean().default(false),
      RG: Yup.string().min(7).max(14).required(),
      CPF: Yup.string().length(11).required(),
      DataNascimento: Yup.date().required(),
      Sexo: Yup.string().matches(/M|F/).required(),
      EstadoCivil: Yup.number(),
      OrgaoEmissor: Yup.string().required(),
      Nacionalidade: Yup.string().required(),
      Enderecos: Yup.array().of(enderecoSchema),
      Emails: Yup.array().ensure().compact().of(emailSchema),
      Telefones: Yup.array().ensure().compact().of(telefoneSchema),
    });

    const schema = Yup.object().shape({
      TipoContrato: Yup.string().matches(/5|9/).required(),
      MotivoAdesao: Yup.number().default(268),
      RenovacaoAutomatica: Yup.boolean().default(false),
      DataAdesao: Yup.date().default(new Date()),
      DataVencimento: Yup.date(),
      Vendedor: Yup.number(),
      Averbacao: Yup.boolean(),
      Corretora: Yup.number(),
      PrazoVigencia: Yup.string()
        .matches(/BIENAL|ANUAL|DEZ MESES/)
        .default('BIENAL'),
      // Produto: Yup.number().when('TipoContrato', (validator, s) =>
      //   validator === '5' ? s.required() : s.nullable().default(null)
      // ),
      DataFechamento: Yup.date(),
      Convenio: Yup.string()
        .matches(/Pessoa Fisica|Empresa|Municipio|Estado|Federal/)
        .default('Pessoa Fisica'),
      CentroCusto: Yup.number().when('$convenio', (c, s) =>
        c !== 'Pessoa Fisica' && c !== 'Empresa' ? s.required() : s
      ),
      ResponsavelFinanceiro: Yup.object().shape({
        TipoPessoa: Yup.string().matches(/F|J/).required(),
        Nome: Yup.string()
          .when('TipoPessoa', { is: 'F', then: Yup.string().required() })
          .transform(function transformValue(value) {
            return this.isType(value) && value !== null ? value.toUpperCase() : value;
          }),
        RazaoSocial: Yup.string()
          .when('TipoPessoa', { is: 'J', then: Yup.string().required() })
          .transform(function transformValue(value) {
            return this.isType(value) && value !== null ? value.toUpperCase() : value;
          }),
        NomeFantasia: Yup.string()
          .when('TipoPessoa', { is: 'J', then: Yup.string().required() })
          .transform(function transformValue(value) {
            return this.isType(value) && value !== null ? value.toUpperCase() : value;
          }),
        InscricaoEstadual: Yup.string().when('TipoPessoa', { is: 'J', then: Yup.string().required() }),
        IncricaoMunicipal: Yup.string().when('TipoPessoa', { is: 'J', then: Yup.string() }),
        RG: Yup.string().min(7).max(14).when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        CPF: Yup.string().length(11).when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        CNPJ: Yup.string().length(14).when('TipoPessoa', { is: 'J', then: Yup.string().required() }),
        DataNascimento: Yup.date().when('TipoPessoa', { is: 'F', then: Yup.date().required() }),
        Sexo: Yup.string().matches(/M|F/).when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        EstadoCivil: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string() }),
        OrgaoEmissor: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        // NomedaMae: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        Nacionalidade: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        Enderecos: Yup.array().of(enderecoSchema),
        Emails: Yup.array().ensure().compact().of(emailSchema),
        Telefones: Yup.array().ensure().compact().of(telefoneSchema),
      }),
      FormaPagamento: Yup.object().shape({
        TipoCarteira: Yup.number().integer().required(),
        DiaVencimentoMes: Yup.number().integer().default(10),
        Modalidade: Yup.number().integer().required(),
        Parcelas: Yup.number().integer(),
        CartaoCredito: Yup.object()
          .shape({
            Numero: Yup.string(),
            CodigoSeguranca: Yup.number().integer(),
            TipoCartao: Yup.number().integer(),
            Validade: Yup.date(),
            Titular: Yup.string(),
            Principal: Yup.boolean(),
          })
          .nullable()
          .default(null),
        Conta: Yup.object()
          .shape({
            TipoConta: Yup.number().integer(),
            Operacao: Yup.string().nullable(),
            Agencia: Yup.number().integer(),
            Digito: Yup.string(),
            Numero: Yup.string(),
            Principal: Yup.boolean().default(true),
            Identificacao: Yup.string(),
          })
          .nullable()
          .default(null),
      }),
      Beneficiarios: Yup.array().of(beneficiarioSchema),
      GrupoFamiliar: Yup.array()
        .ensure()
        .compact()
        .when('TipoContrato', (validator, s) => (validator === '9' ? s.required() : s.nullable().default(null)))
        .of(
          Yup.object()
            .shape({
              Produto: Yup.number().required(),
              Beneficiarios: Yup.array().of(beneficiarioSchema),
            })
            .notRequired()
            .nullable()
            .default(null)
        ),
      DataPagamento: Yup.date(),
      Pagamentos: Yup.array().of(
        Yup.object({
          Modalidade: Yup.number().integer().required(),
          Carteira: Yup.number().integer().required(),
          Valor: Yup.number().required(),
          NumeroTransacao: Yup.string(),
          PaymentId: Yup.string(),
          Tid: Yup.string(),
          Especie: Yup.boolean(),
          Deposito: Yup.boolean(),
          CartaoCredito: Yup.object({
            Numero: Yup.string(),
            Validade: Yup.string().matches(/^(0?[1-9]|1[012])[/-]\d{4}$/gim, {
              message:
                'Invalid date format. Valid format for this field is MM/YYYY where the month must be between 1 and 12 and year with four digits',
              excludeEmptyString: false,
            }),
            CodigoSeguranca: Yup.string(),
            TipoCartaoId: Yup.number().integer(),
          })
            .notRequired()
            .default(null)
            .nullable(),
          Cheque: Yup.object({
            Emitente: Yup.string(),
            Conta: Yup.string(),
            Numero: Yup.string(),
            ChequeId: Yup.number().integer(),
          })
            .notRequired()
            .default(null)
            .nullable(),
          Boleto: Yup.object({
            Numero: Yup.string(),
          })
            .notRequired()
            .default(null)
            .nullable(),
          Consignado: Yup.object({
            Documento: Yup.string(),
            Matricula: Yup.string(),
          })
            .notRequired()
            .default(null)
            .nullable(),
          Transferencia: Yup.object({
            ContaId: Yup.number().integer(),
            AgenciaId: Yup.number().integer(),
          })
            .notRequired()
            .default(null)
            .nullable(),
        })
      ),
    });

    await schema.validate(req.body, { abortEarly: false, context: { convenio: req.body.Convenio || 'Pessoa Fisica' } });

    if (req.body.Convenio && req.body.Convenio !== 'Pessoa Fisica' && !req.body.CentroCusto) {
      throw new Error('É preciso informar um centro custo');
    }

    req.formValidation = schema.cast(req.body);
    // console.log(schema.cast(req.body));
    return next();
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        error: 400,
        data: { message: 'Validation fails', errors: error.errors },
      });
    }
    throw error;
  }
};
