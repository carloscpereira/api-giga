import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      statusid: Yup.number().integer(),
      lop_in_tipo_movimento: Yup.string().required(),
      lop_in_cobranca: Yup.boolean(),
      pessoausuarioid: Yup.number().integer(),
    });

    await schema.validate(req.body);

    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
