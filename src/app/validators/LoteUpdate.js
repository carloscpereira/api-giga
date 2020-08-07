import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      body: Yup.object().shape({
        statusid: Yup.number().integer(),
        pessoausuarioid: Yup.number().integer(),
        lop_dt_baixa: Yup.date(),
        lop_id_pessoa: Yup.number().integer(),
        lop_id_tipo_baixa: Yup.number().integer(),
        lop_in_tipo_movimento: Yup.string(),
        lop_id_contrato: Yup.number().integer(),
        lop_in_cobranca: Yup.boolean(),
      }),
      params: Yup.object().shape({
        id: Yup.number().integer().required(),
      }),
    });

    await schema.validate(req);

    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
