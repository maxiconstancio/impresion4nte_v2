const { Cuota, Gasto } = require("../models");
const { Op } = require ("sequelize");

module.exports = {

  async getProximas(req, res) {
    try {
      const dias = parseInt(req.query.dias) || 15;
      const hoy = new Date();
      const limite = new Date();
      limite.setDate(hoy.getDate() + dias);
  
      const cuotas = await Cuota.findAll({
        where: {
          pagado: false,
          fecha_vencimiento: {
            [Op.between]: [hoy.toISOString().split("T")[0], limite.toISOString().split("T")[0]]
          }
        },
        include: [Gasto],
        order: [["fecha_vencimiento", "ASC"]]
      });
  
      res.json(cuotas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getAll(req, res) {
    try {
      const cuotas = await Cuota.findAll();
      res.json(cuotas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const cuota = await Cuota.findByPk(req.params.id);
      if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });
      res.json(cuota);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const cuota = await Cuota.findByPk(req.params.id);
      if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });

      await cuota.update(req.body);
      res.json(cuota);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const rowsDeleted = await Cuota.destroy({ where: { id: req.params.id } });
      if (!rowsDeleted) return res.status(404).json({ error: "Cuota no encontrada" });
      res.json({ mensaje: "Cuota eliminada" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
