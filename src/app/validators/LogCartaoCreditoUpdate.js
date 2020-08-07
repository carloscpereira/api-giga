import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      params: Yup.object().shape({
        id: Yup.number().integer().required(),
      }),
      body: Yup.object().shape({
        tid: Yup.string(),
        authorization_code: Yup.string(),
        payment_id: Yup.string(),
        return_message: Yup.string(),
        return_code: Yup.number().integer(),
        establishment: Yup.number().integer(),
        parcelaid: Yup.number().integer(),
        response: Yup.string(),
        processamento: Yup.date(),
      }),
    });

    await schema.validate(req);

    return next();
  } catch (error) {
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
