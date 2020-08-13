import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      descricao: Yup.string().min(1).max(30),
      cartaocredito: Yup.string()
        .length(1)
        .matches(/^(0|1)$/g),
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
