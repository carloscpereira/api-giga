import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      tid: Yup.string().required(),
      authorization_code: Yup.string().required(),
      payment_id: Yup.string().required(),
      return_message: Yup.string().required(),
      return_code: Yup.string().required(),
      establishment: Yup.number().integer().required(),
      parcelaid: Yup.number().integer().required(),
      response: Yup.string(),
      processamento: Yup.date().required(),
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
