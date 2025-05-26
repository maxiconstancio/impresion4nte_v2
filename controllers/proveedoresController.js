const { Proveedor } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const proveedores = await Proveedor.findAll();
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const nuevo = await Proveedor.create(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
