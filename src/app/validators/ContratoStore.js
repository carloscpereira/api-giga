import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      numerocontrato: Yup.string(),
      numeroproposta: Yup.string(),
      operadoraid: Yup.number().integer(),
      statusid: Yup.number().integer().required(),
      dataadesao: Yup.date().required(),
      datacancelamento: Yup.date(),
      dataregistrosistema: Yup.date(),
      datalimitecancelamento: Yup.date(),
      datainicialvigencia: Yup.date().required(),
      datafinalvigencia: Yup.date().required(),
      ciclovigenciacontrato: Yup.number().integer().required(),
      quantidademesesvigencia: Yup.number().integer(),
      temporeativacao: Yup.date(),
      prazolimitebloqueio: Yup.number().integer().required(),
      obs: Yup.string(),
      tipocontratoid: Yup.number().integer().required(),
      tipotabelausoid: Yup.number().integer(),
      descontotabelauso: Yup.number(),
      chaveex: Yup.number().integer(),
      tipodecarteiraid: Yup.number().integer(),
      databloqueio: Yup.date(),
      motivoadesaoid: Yup.number().integer().required(),
      motivocancelamentoid: Yup.number().integer(),
      datareativacao: Yup.date(),
      bloqueadopesquisa: Yup.boolean().required().required(),
      localid: Yup.number().integer().required(),
      con_in_renovacao_auto: Yup.boolean().required(),
      con_dt_geracao_parcelas: Yup.date(),
      con_in_situacao: Yup.boolean().required(),
      con_id_regra_vigencia: Yup.number().integer().required(),
      importado: Yup.string().required(),
      con_nu_prazo_cancela_inad: Yup.number().integer().required(),
      tipodecarteiracontratoid: Yup.number().integer().required(),
      id_gld: Yup.number().integer(),
      centrocustoid: Yup.number().integer(),
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
