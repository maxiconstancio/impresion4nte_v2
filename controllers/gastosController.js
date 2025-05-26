const { Gasto, Cuota, Proveedor } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const gastos = await Gasto.findAll({ include: [Cuota, Proveedor] });
      res.json(gastos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const gasto = await Gasto.findByPk(req.params.id, { include: [Cuota, Proveedor] });
      if (!gasto) return res.status(404).json({ error: "Gasto no encontrado" });
      res.json(gasto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { tipo, descripcion, fecha, monto_total, proveedor_id, en_cuotas, cantidad_cuotas, cuotas } = req.body;
    try {
      const nuevoGasto = await Gasto.create({
        tipo, descripcion, fecha, monto_total, proveedor_id, en_cuotas, cantidad_cuotas
      });

      if (en_cuotas && cuotas && cuotas.length) {
        for (const cuota of cuotas) {
          await Cuota.create({ ...cuota, gasto_id: nuevoGasto.id });
        }
      }

      res.status(201).json(nuevoGasto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const gasto = await Gasto.findByPk(req.params.id);
      if (!gasto) return res.status(404).json({ error: "Gasto no encontrado" });

      await gasto.update(req.body);
      res.json(gasto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const rowsDeleted = await Gasto.destroy({ where: { id: req.params.id } });
      if (!rowsDeleted) return res.status(404).json({ error: "Gasto no encontrado" });
      res.json({ mensaje: "Gasto eliminado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
