/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { Sequelize, Transaction, Op } from 'sequelize';
import { format, isValid } from 'date-fns';

import Contrato from '../models/Sequelize/Contrato';
import Beneficiario from '../models/Sequelize/Beneficiario';
import Titulo from '../models/Sequelize/Titulo';
import Parcela from '../models/Sequelize/Parcela';
import CartaoCredito from '../models/Sequelize/CartaoCredito';
import TipoCarteira from '../models/Sequelize/TipoCarteira';

export default async ({ connection, transaction, date = new Date() }) => {
  let t = transaction;

  if (!connection || !(connection instanceof Sequelize)) {
    throw new Error('Não foi possível estabalecer conexão com o banco de dados');
  }

  if (!transaction || !(transaction instanceof Transaction)) {
    t = await connection.transaction();
  }

  try {
    let datavencimento = null;

    if (!(date instanceof Date) && typeof date !== 'string' && isValid(new Date(date))) {
      datavencimento = format(new Date(date), 'yyyy-MM-dd');
    } else if (date instanceof Date) {
      datavencimento = format(date, 'yyyy-MM-dd');
    }

    // const contratos = {};
    const contratos = await Contrato.findAll({
      where: {
        [Op.and]: [{ tipocontratoid: 5 }, { statusid: { [Op.in]: [8, 60, 62] } }],
      },
      attributes: ['id', 'statusid', 'tipocontratoid', 'contrato_parent'],
      include: [
        {
          model: CartaoCredito,
          as: 'cartao',
          require: true,
          attributes: [
            'numerocartao',
            'codigosegurancacartao',
            'tipocartaoid',
            'validadecartao',
            'nome_titular',
            'car_in_principal',
          ],
          where: { validadecartao: { [Op.gt]: connection.literal('current_date') } },
        },
        {
          model: Titulo,
          as: 'titulos',
          required: true,
          attributes: ['id'],
          include: [
            {
              model: TipoCarteira,
              as: 'carteira',
              required: false,
              attributes: ['id', 'descricao'],
              where: {
                modalidadepagamentoid: 2,
              },
            },
            {
              model: Parcela,
              as: 'parcelas',
              attributes: ['id', 'statusgrupoid', 'datavencimento', 'valor'],
              required: true,
              where: {
                statusgrupoid: 1,
                ...(datavencimento
                  ? { datavencimento }
                  : { datavencimento: { [Op.eq]: connection.literal('current_date') } }),
                nossonumero: null,
                pcl_in_cobranca: false,
                pcl_in_pause: false,
              },
            },
          ],
        },
      ],
      transaction: t,
    });

    const contratosCorretos = [];

    for (const contrato of contratos) {
      const isParent = await Contrato.findAll({ where: { contrato_parent: contrato.id }, transaction: t });

      if (!isParent.length) {
        const [beneficiarioContratosParentes, beneficiariosContrato] = await Promise.all([
          Beneficiario.findAll({
            transaction: t,
            where: { contratoid: { [Op.in]: isParent.map(({ id }) => id) } },
          }),
          Beneficiario.findAll({
            transaction: t,
            where: { contratoid: contrato.id, ativo: '1' },
          }),
        ]);

        if (beneficiarioContratosParentes.length !== beneficiariosContrato) {
          contratosCorretos.push(contrato);
          continue;
        }

        const isEqual = beneficiariosContrato.every(({ pessoabeneficiarioid: id }) => {
          return !!beneficiarioContratosParentes.find(({ pessoabeneficiarioid }) => pessoabeneficiarioid === id);
        });

        if (!isEqual) {
          contratosCorretos.push(contrato);
        }
      } else {
        contratosCorretos.push(contrato);
      }
    }

    await t.commit();
    return contratosCorretos;
  } catch (error) {
    if (!transaction) await t.rollback();

    throw error;
  }
};
