import Yup from 'yup';

export default async(req, res, next) => {
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
            Valor: Yup.number(),
            Titular: Yup.boolean().default(false),
            RG: Yup.string().min(5).max(14),
            CPF: Yup.string().length(11),
            DataNascimento: Yup.date(),
            Sexo: Yup.string().matches(/M|F/),
            EstadoCivil: Yup.string(),
            OrgaoEmissor: Yup.string(),
            Nacionalidade: Yup.string(),
            Enderecos: Yup.array().of(enderecoSchema),
            Emails: Yup.array().ensure().compact().of(emailSchema),
            Telefones: Yup.array().ensure().compact().of(telefoneSchema),
        });

        const schema = Yup.object.shape({
            Vendedor: Yup.number(),
            PrazoVigencia: Yup.string()
                .matches(/BIENAL|ANUAL|DEZ MESES/)
                .default('BIENAL'),
            Produto: Yup.number().when('TipoContrato', (validator, s) =>
                validator === '5' ? s.required() : s.nullable().default(null)
            ),
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
                    })
                    .notRequired()
                    .default(null)
                    .nullable(),
            }),
            Beneficiarios: Yup.array()
                .of(beneficiarioSchema)
                .test('has-holder', 'O grupo de beneficiários precisa de apenas um titular', (value) => {
                    const titular = value.filter((b) => b.Titular);

                    return titular.length === 1;
                }),
        });

        await schema.validate(req.body, { abortEarly: false });

        console.log(req.body.Convenio);
        req.formValidation = schema.cast(req.body);
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