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
      Complemento: Yup.string(),
      Numero: Yup.string(),
      Principal: Yup.boolean(),
      Telefones: Yup.array().ensure().compact().of(telefoneSchema),
    });

    const pessoaFisicaSchema = Yup.object().shape({
      Nome: Yup.string().transform(function transformValue(value) {
        return this.isType(value) && value !== null ? value.toUpperCase() : value;
      }),
      RG: Yup.string().min(7).max(14).required(),
      CPF: Yup.string().length(11).required(),
      DataNascimento: Yup.date().required(),
      Sexo: Yup.string().matches(/M|F/).required(),
      EstadoCivil: Yup.string().required(),
      OrgaoEmissor: Yup.string().required(),
      NomedaMae: Yup.string().required(),
      Nacionalidade: Yup.string().required(),
    });

    const pessoaJuridicaSchema = Yup.object().shape({
      RazaoSocial: Yup.string()
        .required()
        .transform(function transformValue(value) {
          return this.isType(value) && value !== null ? value.toUpperCase() : value;
        }),
      NomeFantasia: Yup.string()
        .required()
        .transform(function transformValue(value) {
          return this.isType(value) && value !== null ? value.toUpperCase() : value;
        }),
      InscricaoEstadual: Yup.string().required(),
      IncricaoMunicipal: Yup.string().required(),
      CNPJ: Yup.string().length(14).required(),
    });

    const schema = Yup.object().shape({
      TipoContrato: Yup.string().matches(/5|9/).required(),
      MotivoAdesao: Yup.number().default(268),
      RenovacaoAutomatica: Yup.boolean().default(false),
      DataAdesao: Yup.date().default(new Date()),
      Valor: Yup.number().required(),
      ValorDesconto: Yup.number().default(0),
      PrazoVigencia: Yup.string()
        .matches(/BIENAL|ANUAL|DEZ MESES/)
        .default('BIENAL'),
      Plano: Yup.object()
        .shape({
          ID: Yup.number().integer().required(),
          Versao: Yup.number().integer().required(),
        })
        .when('TipoContrato', (validator, s) => (validator === '5' ? s.required() : s.nullable().default(null))),
      Convenio: Yup.string()
        .matches(/Pessoa Fisica|Empresa|Municipio|Estado|Federal/)
        .default('Pessoa Fisica'),
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
        EstadoCivil: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        OrgaoEmissor: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        NomedaMae: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        Nacionalidade: Yup.string().when('TipoPessoa', { is: 'F', then: Yup.string().required() }),
        Enderecos: Yup.array().of(enderecoSchema),
        Emails: Yup.array().ensure().compact().of(emailSchema),
        Telefones: Yup.array().ensure().compact().of(telefoneSchema),
        CentroCusto: Yup.lazy((value) => {
          switch (typeof value) {
            case 'object':
              return pessoaJuridicaSchema.when('$convenio', (c, s) =>
                c !== 'Pessoa Fisica' && c !== 'Empresa' ? s.required() : s
              );
            default:
              return Yup.string().when('$convenio', (c, s) =>
                c !== 'Pessoa Fisica' && c !== 'Empresa' ? s.required() : s
              );
          }
        }),
      }),
      Titular: pessoaFisicaSchema,
      FormaPagamento: Yup.object().shape({
        TipoCarteira: Yup.number().integer().required(),
        DiaVencimentoMes: Yup.number().integer().default(10),
        CartaoCredito: Yup.object()
          .shape({
            Numero: Yup.string().required(),
            CodigoSeguranca: Yup.number().integer().required(),
            TipoCartao: Yup.number().integer().required(),
            Validade: Yup.date().required(),
            Titular: Yup.string().required(),
          })
          .notRequired()
          .default(null)
          .nullable(),
      }),
      Beneficiarios: Yup.array().of(pessoaFisicaSchema),
      GrupoFamiliar: Yup.array()
        .ensure()
        .compact()
        .when('TipoContrato', (validator, s) => (validator === '9' ? s.required() : s.nullable().default(null)))
        .of(
          Yup.object()
            .shape({
              Plano: Yup.object().shape({
                ID: Yup.number().integer().required(),
                Versao: Yup.number().integer().required(),
              }),
              Beneficiarios: Yup.array().of(pessoaFisicaSchema),
            })
            .notRequired()
            .nullable()
            .default(null)
        ),
    });

    await schema.validate(req.body, { abortEarly: false, context: { convenio: req.body.Convenio || 'Pessoa Fisica' } });
    console.log(req.body.Convenio);
    if (req.body.Convenio && req.body.Convenio !== 'Pessoa Fisica' && !req.body.CentroCusto) {
      throw new Error('É preciso informar um centro custo');
    }

    req.formValidation = schema.cast(req.body);
    console.log(schema.cast(req.body));
    // return res.send('ok');
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
