const { Ingreso } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const ingresos = await Ingreso.findAll();
      res.json(ingresos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const ingreso = await Ingreso.findByPk(req.params.id);
      if (!ingreso) return res.status(404).json({ error: "Ingreso no encontrado" });
      res.json(ingreso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const nuevo = await Ingreso.create(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const ingreso = await Ingreso.findByPk(req.params.id);
      if (!ingreso) return res.status(404).json({ error: "Ingreso no encontrado" });

      await ingreso.update(req.body);
      res.json(ingreso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const rowsDeleted = await Ingreso.destroy({ where: { id: req.params.id } });
      if (!rowsDeleted) return res.status(404).json({ error: "Ingreso no encontrado" });
      res.json({ mensaje: "Ingreso eliminado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
