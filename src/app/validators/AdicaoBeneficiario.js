import * as Yup from 'yup';

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
            Cidade: Yup.number().integer(),
            Estado: Yup.string(),
            Complemento: Yup.string(),
            Numero: Yup.string(),
            Principal: Yup.boolean(),
            Telefones: Yup.array().ensure().compact().of(telefoneSchema),
        });

        const schema = Yup.object().shape({
            Nome: Yup.string().transform(function transformValue(value) {
                return this.isType(value) && value !== null ? value.toUpperCase() : value;
            }),
            Vinculo: Yup.string().default('OUTROS'),
            Valor: Yup.number(),
            Produto: Yup.number().integer(),
            GrupoFamiliar: Yup.number().integer(),
            RG: Yup.string().min(5).max(14).required(),
            CPF: Yup.string().length(11).required(),
            DataNascimento: Yup.date().required(),
            DataAdesao: Yup.date().default(new Date()),
            Sexo: Yup.string().matches(/M|F/).required(),
            EstadoCivil: Yup.string().default('Solteiro'),
            OrgaoEmissor: Yup.string().required(),
            Nacionalidade: Yup.string().required(),
            Enderecos: Yup.array().of(enderecoSchema),
            Emails: Yup.array().ensure().compact().of(emailSchema),
            Telefones: Yup.array().ensure().compact().of(telefoneSchema),
            CoberturaParcial: Yup.bool().default(false),
            Requerente: Yup.bool().default(false),
        });

        await schema.validate(req.body, { abortEarly: false });

        req.body = schema.cast(req.body);
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