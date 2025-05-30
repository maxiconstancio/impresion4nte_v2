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
  async update(req, res) {
    const { fecha, metodo_pago, tipo, total, productos } = req.body;
    const ventaId = req.params.id;
  
    if (!productos || !productos.length) {
      return res.status(400).json({ error: "La venta debe tener al menos un producto." });
    }
  
    try {
      const venta = await Venta.findByPk(ventaId);
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
  
      // actualizar campos principales
      venta.fecha = fecha;
      venta.metodo_pago = metodo_pago;
      venta.tipo = tipo;
      venta.total = total;
      await venta.save();
  
      // eliminar productos anteriores
      await VentaProducto.destroy({ where: { venta_id: ventaId } });
  
      // volver a cargar productos nuevos
      for (const item of productos) {
        await VentaProducto.create({
          venta_id: ventaId,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        });
      }
  
      res.json({ mensaje: "Venta actualizada correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async delete(req, res) {
    try {
      const venta = await Venta.findByPk(req.params.id, {
        include: {
          model: VentaProducto,
          as: "productos"
        }
      });
  
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
  
      // Devolver stock
      for (const item of venta.productos) {
        const producto = await Producto.findByPk(item.producto_id);
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save();
        }
      }
  
      // Eliminar productos de la venta
      await VentaProducto.destroy({ where: { venta_id: venta.id } });
  
      // Eliminar la venta
      await venta.destroy();
  
      res.json({ mensaje: "Venta eliminada y stock restaurado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  ,

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
