import Parcela from '../models/Sequelize/Parcela';

class BoletoController {
  async destroy(req, res) {
    const { id } = req.params;
    const { testando } = req.body;

    console.log(testando);

    const parcela = await Parcela.findByPk(id);

    if (!parcela) {
      throw new Error('Parcela não encontrada');
    }

    parcela.linhadigitavel = null;
    parcela.codigobarras = null;
    parcela.nossonumero = null;

    parcela.save(['linhadigitavel', 'codigobarras', 'nossonumero']);

    return res.json({ parcela });
  }
}

export default new BoletoController();
