import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      planoid: Yup.number().integer().required(),
      versaoid: Yup.number().integer().required(),
      segmentacaoassistencialid: Yup.number().integer().required(),
      participacaofinanceiraid: Yup.number().integer().required(),
      tipocontratacaoid: Yup.number().integer().required(),
      tipoareaabrangenciaid: Yup.number().integer().required(),
      areacoberturaid: Yup.number().integer().required(),
      limitediasbloqueio: Yup.number().integer().required(),
      registroans: Yup.string().required(),
      codigo: Yup.number().integer().required(),
      limitemensalautorizacao: Yup.number().integer().required(),
      pro_nu_parcelas_financiadas: Yup.number().integer().required(),
      pro_id_tipo_contrato: Yup.number().integer().required(),
      pro_id_regra_vigencia: Yup.number().integer().required(),
      prd_in_bloqueado: Yup.boolean().default(false),
      prd_in_renovaauto: Yup.boolean().default(false),
      descricao: Yup.string().required(),
    });

    await schema.validate(req.body);

    req.body = schema.cast(req.body);

    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
