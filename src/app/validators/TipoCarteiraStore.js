import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      descricao: Yup.string().min(1).max(60).required(),
      modalidadepagamentoid: Yup.number().integer().required(),
      bancoid: Yup.number().integer(),
      tipocartaoid: Yup.number().integer(),
      carteira: Yup.string(),
      modpagantigo: Yup.number().integer(),
      transferenciaoutrobanco: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
      boletocomregistro: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
      adicionalcomissao: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
      cod_remessa: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
      cod_cancelamento: Yup.string().min(1).max(2),
      deposito_identificado: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
      diafechamentoconsignataria: Yup.number().integer(),
      tdc_in_documento_cobranca: Yup.boolean().required(),
      tdc_in_bloqueio_cadastro: Yup.boolean().required(),
      nu_prazo_inadimplencia_cobranca: Yup.number().integer().required(),
      nu_prazo_tolerancia_autorizacao: Yup.number().integer(),
      nu_prazo_bloqueio_contrato: Yup.number().integer(),
    });

    await schema.validate(req.body);

    return next();
  } catch (error) {
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
