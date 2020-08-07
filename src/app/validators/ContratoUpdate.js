import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      body: Yup.object().shape({
        numerocontrato: Yup.string(),
        numeroproposta: Yup.string(),
        operadoraid: Yup.number().integer(),
        statusid: Yup.number().integer(),
        dataadesao: Yup.date(),
        datacancelamento: Yup.date(),
        dataregistrosistema: Yup.date(),
        datalimitecancelamento: Yup.date(),
        datainicialvigencia: Yup.date(),
        datafinalvigencia: Yup.date(),
        ciclovigenciacontrato: Yup.number().integer(),
        quantidademesesvigencia: Yup.number().integer(),
        temporeativacao: Yup.date(),
        prazolimitebloqueio: Yup.number().integer(),
        obs: Yup.string(),
        tipocontratoid: Yup.number().integer(),
        tipotabelausoid: Yup.number().integer(),
        descontotabelauso: Yup.number(),
        chaveex: Yup.number().integer(),
        tipodecarteiraid: Yup.number().integer(),
        databloqueio: Yup.date(),
        motivoadesaoid: Yup.number().integer(),
        motivocancelamentoid: Yup.number().integer(),
        datareativacao: Yup.date(),
        bloqueadopesquisa: Yup.boolean(),
        localid: Yup.number().integer(),
        con_in_renovacao_auto: Yup.boolean(),
        con_dt_geracao_parcelas: Yup.date(),
        con_in_situacao: Yup.boolean(),
        con_id_regra_vigencia: Yup.number().integer(),
        importado: Yup.string(),
        con_nu_prazo_cancela_inad: Yup.number().integer(),
        tipodecarteiracontratoid: Yup.number().integer(),
        id_gld: Yup.number().integer(),
        centrocustoid: Yup.number().integer(),
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
