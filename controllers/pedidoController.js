const { Pedido, Producto, PedidoProducto, Venta, VentaProducto } = require("../models");

module.exports = {
  async listar(req, res) {
    const pedidos = await Pedido.findAll({
      include: {
        model: Producto,
        through: {
          attributes: ["cantidad", "observaciones", "precio_unitario"],
        },
      },
      order: [["fecha", "DESC"]],
    });
    res.json(pedidos);
  },

  async listarPresupuestos(req, res) {
    const presupuestos = await Pedido.findAll({
      where: { estado: "presupuesto" },
      include: {
        model: Producto,
        through: {
          attributes: ["cantidad", "observaciones", "precio_unitario"],
        },
      },
      order: [["fecha", "DESC"]],
    });
    res.json(presupuestos);
  },

  async crear(req, res) {
    try {
      const { cliente, estado = "presupuesto", comentarios = "", productos } = req.body;

      const pedido = await Pedido.create({ cliente, estado, comentarios });

      for (const item of productos) {
        const producto = await Producto.create({
          nombre: item.nombre,
          descripcion: item.observaciones,
          precio_unitario: item.precio_unitario,
          stock: 0,
          activo: false,
        });

        await PedidoProducto.create({
          pedidoId: pedido.id,
          productoId: producto.id,
          cantidad: item.cantidad,
          observaciones: item.observaciones,
          precio_unitario: item.precio_unitario,
        });
      }

      res.status(201).json({ message: "Presupuesto registrado", pedidoId: pedido.id });
    } catch (err) {
      console.error("Error al crear presupuesto:", err);
      res.status(500).json({ error: "Error al crear presupuesto" });
    }
  },
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
  
      await PedidoProducto.destroy({ where: { pedidoId: id } });
      await pedido.destroy();
  
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
      res.status(500).json({ error: "Error al eliminar pedido" });
    }
  },
  async actualizarPresupuesto(req, res) {
    try {
        console.log("Body recibido:", req.body);
      const { id } = req.params;
      const { cliente, comentarios, productos } = req.body;

      const pedido = await Pedido.findByPk(id, {
        include: {
          model: Producto,
          through: { attributes: ["cantidad", "observaciones", "precio_unitario"] },
        },
      });

      if (!pedido) return res.status(404).json({ error: "Presupuesto no encontrado" });

      await pedido.update({ cliente, comentarios });

      await PedidoProducto.destroy({ where: { pedidoId: id } });

      for (const item of productos) {
        const producto = await Producto.create({
          nombre: item.nombre,
          descripcion: item.observaciones,
          precio_unitario: item.precio_unitario,
          stock: 0,
          activo: false,
        });

        await PedidoProducto.create({
          pedidoId: pedido.id,
          productoId: producto.id,
          cantidad: item.cantidad,
          observaciones: item.observaciones,
          precio_unitario: item.precio_unitario,
        });
      }

      res.json({ message: "Presupuesto actualizado correctamente" });
    } catch (err) {
      console.error("Error al actualizar presupuesto:", err);
      res.status(500).json({ error: "Error al actualizar presupuesto" });
    }
  },


  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const pedido = await Pedido.findByPk(id, {
        include: {
          model: Producto,
          through: {
            attributes: ["cantidad", "observaciones", "precio_unitario"],
          },
        },
      });

      if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

      const estadoAnterior = pedido.estado;

      await pedido.update({ estado });

      if (estado === "entregado" && estadoAnterior !== "entregado") {
        const total = pedido.Productos.reduce((sum, p) => {
          const precio = parseFloat(p.PedidoProducto?.precio_unitario ?? p.precio_unitario) || 0;
          const cantidad = parseInt(p.PedidoProducto?.cantidad) || 0;
          return sum + (precio * cantidad);
        }, 0);

        const venta = await Venta.create({
          tipo: "pedido",
          fecha: new Date(),
          total,
          metodoPago: "efectivo",
          estado: "completada",
        });

        for (const p of pedido.Productos) {
          const precio = parseFloat(p.PedidoProducto?.precio_unitario ?? p.precio_unitario) || 0;
          await VentaProducto.create({
            ventaId: venta.id,
            productoId: p.id,
            cantidad: p.PedidoProducto.cantidad,
            precio_unitario: precio,
          });

          await p.decrement("stock", { by: p.PedidoProducto.cantidad });
        }
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
};
