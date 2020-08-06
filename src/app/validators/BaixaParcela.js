import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      LoteId: Yup.number().integer(),
      TipoBaixa: Yup.number().integer(),
      PessoaId: Yup.number().integer(),
      TipoMovimento: Yup.string().matches(/(C|D)/, {
        message: "Transaction type must be 'C' for Credit and 'D' for Debit",
        excludeEmptyString: true,
      }),
      FormaPagamento: Yup.array()
        .of(
          Yup.object({
            Modalidade: Yup.number().integer().required(),
            Carteira: Yup.number().integer().required(),
            Valor: Yup.number().required(),
            NumeroTransacao: Yup.string(),
            PaymentId: Yup.string(),
            Tid: Yup.string(),
            CartaoCredito: Yup.object({
              Numero: Yup.string().required(),
              Validade: Yup.string()
                .matches(/^(0?[1-9]|1[012])[/-]\d{4}$/gim, {
                  message:
                    'Invalid date format. Valid format for this field is MM/YYYY where the month must be between 1 and 12 and year with four digits',
                  excludeEmptyString: false,
                })
                .required(),
              CodigoSeguranca: Yup.string().min(3).max(4).required(),
              TipoCartaoId: Yup.number().integer().required(),
            })
              .notRequired()
              .default(null)
              .nullable(),
            Cheque: Yup.object({
              Emitente: Yup.string().required(),
              Conta: Yup.string().required(),
              Numero: Yup.string().required(),
              ChequeId: Yup.number().integer().required(),
            })
              .notRequired()
              .default(null)
              .nullable(),
            Boleto: Yup.object({
              Numero: Yup.string().required(),
            })
              .notRequired()
              .default(null)
              .nullable(),
            Consignado: Yup.object({
              Documento: Yup.string().required(),
              Matricula: Yup.string().required(),
            })
              .notRequired()
              .default(null)
              .nullable(),
            Transferencia: Yup.object({
              ContaId: Yup.number().integer().required(),
              AgenciaId: Yup.number().integer().required(),
            })
              .notRequired()
              .default(null)
              .nullable(),
          })
        )
        .required(),
    });

    await schema.validate(req.body);

    const { FormaPagamento } = req.body;
    console.log(FormaPagamento);

    // eslint-disable-next-line no-restricted-syntax
    for (const {
      CartaoCredito,
      Cheque,
      Boleto,
      Consignado,
      Transferencia,
    } of FormaPagamento) {
      if (
        !CartaoCredito &&
        !Cheque &&
        !Boleto &&
        !Consignado &&
        !Transferencia
      ) {
        throw new Yup.ValidationError(
          'It is necessary to inform the payment data for low installment'
        );
      }
    }

    // req.body.FormaPagamento.foreach(
    //   ({ CartaoCredito, Cheque, Boleto, Consignado, Transferencia }) => {
    //     console.log(
    //       !CartaoCredito && !Cheque && !Boleto && !Consignado && !Transferencia
    //     );
    //   }
    // );

    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 400,
      data: { message: 'Validation fails', errors: error.errors },
    });
  }
};
