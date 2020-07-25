import pool from '../../utils/Database';
import Parcela from '../models/Parcela';

class GettersController {
  async parcelas(req, res) {
    try {
      const poolAtemde = pool.atemde;
      const poolIdental = pool.idental;

      const { limit, page, perPage } = req.query;

      let parcelasAtemde = await new Parcela(poolAtemde).newGet(
        req.parsedQuery.query,
        req.parsedQuery.values,
        { limit, page, perPage }
      );

      let parcelasIdental = await new Parcela(poolIdental).newGet(
        req.parsedQuery.query,
        req.parsedQuery.values,
        { limit, page, perPage }
      );

      if (
        (parcelasAtemde && parcelasAtemde.error) ||
        (parcelasIdental && parcelasIdental.error)
      ) {
        return res.status(503).json({
          error: 503,
          data: {
            message: 'Internal Error',
          },
        });
      }

      parcelasAtemde = parcelasAtemde.map((p) => ({
        ...p,
        operadora: 'atemde',
      }));
      parcelasIdental = parcelasIdental.map((p) => ({
        ...p,
        operadora: 'idental',
      }));

      return res.json({
        error: null,
        data: [...parcelasIdental, ...parcelasAtemde],
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 500, data: { message: 'Internal server error' } });
    }
  }
}

export default new GettersController();