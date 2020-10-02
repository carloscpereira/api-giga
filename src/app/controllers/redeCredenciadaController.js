import RedeCredenciada from '../models/RedeCredenciada';

class RedeCredenciadaController {
  async index(req, res) {
    try {
      const response = await new RedeCredenciada(req.pool).findAll();

      if (response && response.error) {
        return res.status(response.error).json(response);
      }

      return res.json({ error: null, data: response });
    } catch (error) {
      return res.status(500).json({ error: 500, data: { message: 'Internal server error' } });
    }
  }
}

export default new RedeCredenciadaController();
