import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      tipo_id: Yup.number().integer().required(),
      return_code: Yup.number().integer(),
      body_request: Yup.string(),
      response_request: Yup.string(),
      parcela_id: Yup.number().integer(),
      is_error: Yup.boolean(),
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
