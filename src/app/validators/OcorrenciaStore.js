import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      dataocorrencia: Yup.date(),
      datavalidade: Yup.date(),
      statusid: Yup.number().integer().required(),
      obs: Yup.string(),
      pessoaagendante: Yup.number().integer(),
      descricao: Yup.string(),
      codigo: Yup.number().integer(),
      numerocontratoid: Yup.number().integer(),
      grupoocorrenciaid: Yup.number().integer(),
      subgrupoocorrencia: Yup.number().integer(),
      departamentoid: Yup.number().integer(),
      setorid: Yup.number().integer(),
      calendario_id: Yup.number().integer(),
      tipoocorrencia_calendario: Yup.number().integer(),
      ocorrenciasistema: Yup.string(),
      horaocorrencia: Yup.string(),
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
