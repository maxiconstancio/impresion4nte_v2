const { Parametro } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const parametros = await Parametro.findAll();
      res.json(parametros);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByClave(req, res) {
    try {
      const parametro = await Parametro.findOne({ where: { clave: req.params.clave } });
      if (!parametro) return res.status(404).json({ error: "Parámetro no encontrado" });
      res.json(parametro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async upsert(req, res) {
    const { clave, valor } = req.body;
    try {
      const [parametro, created] = await Parametro.upsert({ clave, valor });
      res.status(created ? 201 : 200).json(parametro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
