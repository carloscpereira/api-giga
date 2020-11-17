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

    const beneficiarioSchema = Yup.object().shape({
      Nome: Yup.string().transform(function transformValue(value) {
        return this.isType(value) && value !== null ? value.toUpperCase() : value;
      }),
      Vinculo: Yup.string().required(),
      Valor: Yup.number(),
      Titular: Yup.boolean().default(false),
      RG: Yup.string().min(7).max(14).required(),
      CPF: Yup.string().length(11).required(),
      DataNascimento: Yup.date().required(),
      Sexo: Yup.string().matches(/M|F/).required(),
      EstadoCivil: Yup.string(),
      OrgaoEmissor: Yup.string().required(),
      Nacionalidade: Yup.string().required(),
      Enderecos: Yup.array().of(enderecoSchema),
      Emails: Yup.array().ensure().compact().of(emailSchema),
      Telefones: Yup.array().ensure().compact().of(telefoneSchema),
    });

    // const pessoaFisicaSchema = Yup.object().shape({
    //   Nome: Yup.string().transform(function transformValue(value) {
    //     return this.isType(value) && value !== null ? value.toUpperCase() : value;
    //   }),
    //   RG: Yup.string().min(7).max(14).required(),
    //   CPF: Yup.string().length(11).required(),
    //   DataNascimento: Yup.date().required(),
    //   Sexo: Yup.string().matches(/M|F/).required(),
    //   EstadoCivil: Yup.string().required(),
    //   OrgaoEmissor: Yup.string().required(),
    //   NomedaMae: Yup.string().required(),
    //   Nacionalidade: Yup.string().required(),
    // });

    // const pessoaJuridicaSchema = Yup.object().shape({
    //   RazaoSocial: Yup.string()
    //     .required()
    //     .transform(function transformValue(value) {
    //       return this.isType(value) && value !== null ? value.toUpperCase() : value;
    //     }),
    //   NomeFantasia: Yup.string()
    //     .required()
    //     .transform(function transformValue(value) {
    //       return this.isType(value) && value !== null ? value.toUpperCase() : value;
    //     }),
    //   InscricaoEstadual: Yup.string().required(),
    //   IncricaoMunicipal: Yup.string().required(),
    //   CNPJ: Yup.string().length(14).required(),
    // });

    const schema = Yup.object().shape({
      TipoContrato: Yup.string().matches(/5|9/).required(),
      MotivoAdesao: Yup.number().default(268),
      RenovacaoAutomatica: Yup.boolean().default(false),
      DataAdesao: Yup.date().default(new Date()),
      Vendedor: Yup.number(),
      PrazoVigencia: Yup.string()
        .matches(/BIENAL|ANUAL|DEZ MESES/)
        .default('BIENAL'),
      Produto: Yup.number().when('TipoContrato', (validator, s) =>
        validator === '5' ? s.required() : s.nullable().default(null)
      ),
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
      // Titular: beneficiarioSchema,
      FormaPagamento: Yup.object().shape({
        TipoCarteira: Yup.number().integer().required(),
        DiaVencimentoMes: Yup.number().integer().default(10),
        Modalidade: Yup.number().integer().required(),
        CartaoCredito: Yup.object()
          .shape({
            Numero: Yup.string().required(),
            CodigoSeguranca: Yup.number().integer().required(),
            TipoCartao: Yup.number().integer().required(),
            Validade: Yup.date().required(),
            Titular: Yup.string().required(),
            Principal: Yup.boolean().default(true),
          })
          .when('Modalidade', (validator, s) =>
            validator === 2 || validator === 34 ? s.required() : s.nullable().default(null)
          ),
        Conta: Yup.object()
          .shape({
            TipoConta: Yup.number().integer().required(),
            Operacao: Yup.string(),
            Agencia: Yup.number().integer().required(),
            Digito: Yup.number().string().required(),
            Numero: Yup.number().string().required(),
            Principal: Yup.boolean().default(true),
          })
          .when('Modalidade', (validator, s) => (validator === 3 ? s.required : s.nullable().default(null))),
      }),
      Beneficiarios: Yup.array()
        .of(beneficiarioSchema)
        .test('has-holder', 'O grupo de beneficiários precisa de apenas um titular', (value) => {
          const titular = value.filter((b) => b.Titular);

          return titular.length === 1;
        }),
      GrupoFamiliar: Yup.array()
        .ensure()
        .compact()
        .when('TipoContrato', (validator, s) => (validator === '9' ? s.required() : s.nullable().default(null)))
        .of(
          Yup.object()
            .shape({
              Produto: Yup.number().required(),
              Beneficiarios: Yup.array()
                .of(beneficiarioSchema)
                .test('has-holder', 'O grupo de beneficiários precisa de apenas um titular', (value) => {
                  const titular = value.filter((b) => b.Titular);

                  return titular.length === 1;
                }),
            })
            .notRequired()
            .nullable()
            .default(null)
        ),
    });

    await schema.validate(req.body, { abortEarly: false, context: { convenio: req.body.Convenio || 'Pessoa Fisica' } });

    if (req.body.Convenio && req.body.Convenio !== 'Pessoa Fisica' && !req.body.CentroCusto) {
      throw new Error('É preciso informar um centro custo');
    }

    req.formValidation = schema.cast(req.body);
    console.log(schema.cast(req.body));
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
