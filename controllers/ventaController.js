const { Venta, VentaProducto, Producto } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const ventas = await Venta.findAll({
        include: {
          model: VentaProducto,
          as: "productos",
          include: { model: Producto, as: "producto" }
        },
        order: [["fecha", "DESC"]]
      });
      res.json(ventas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const venta = await Venta.findByPk(req.params.id, {
        include: {
          model: VentaProducto,
          as: "productos",
          include: { model: Producto, as: "producto" }
        }
      });
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
      res.json(venta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { fecha, metodo_pago, tipo, productos } = req.body;

    if (!productos || !productos.length) {
      return res.status(400).json({ error: "La venta debe tener al menos un producto." });
    }

    try {
      let total = 0;

      // calcular total
      productos.forEach(p => {
        total += parseFloat(p.precio_unitario) * parseInt(p.cantidad);
      });

      const venta = await Venta.create({ fecha, metodo_pago, tipo, total });

      // registrar productos y ajustar stock
      for (const item of productos) {
        await VentaProducto.create({
          venta_id: venta.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        });

        const producto = await Producto.findByPk(item.producto_id);
        if (producto) {
          producto.stock = producto.stock - item.cantidad;
          await producto.save();
        }
      }

      res.status(201).json({ mensaje: "Venta registrada", venta_id: venta.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
