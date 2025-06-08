const { Producto, VentaProducto, Venta } = require("../models");
const { Op, Sequelize } = require("sequelize");

module.exports = {
  async getAll(req, res) {
    try {
      const { search } = req.query;

      const where = {};

      if (search && search.length >= 3) {
        where[Op.and] = [
          { activo: true },
          { stock: { [Op.gt]: 0 } },
          { nombre: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const productos = await Producto.findAll({
        where,
        limit: search ? 10 : undefined,
        order: [["nombre", "ASC"]],
      });

      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async recomendarPrecio(req, res) {
    const { peso, precio_kilo, costo_impresora, tipo_venta } = req.body;
    if (!peso || !precio_kilo || !costo_impresora) {
      return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    const costo_material = (peso / 1000) * precio_kilo;
    const precio_base = (costo_material + costo_impresora) * 3;

    let precio_final = precio_base;

    if (tipo_venta === "feria") {
      precio_final *= 0.9; // 10% menos si es feria
    }

    const precio_con_debito = precio_final * 1.06;

    res.json({
      costo_material: costo_material.toFixed(2),
      precio_base: precio_base.toFixed(2),
      precio_final: precio_final.toFixed(2),
      precio_con_debito: precio_con_debito.toFixed(2),
    });
  },

  async create(req, res) {
    try {
      const producto = await Producto.create(req.body);
      res.status(201).json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

      await producto.update(req.body);
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const rowsDeleted = await Producto.destroy({ where: { id: req.params.id } });
      if (!rowsDeleted) return res.status(404).json({ error: "Producto no encontrado" });
      res.json({ mensaje: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProductosReposicion(req, res) {
    try {
      const productos = await Producto.findAll({
        where: {
          stock: {
            [Op.lt]: Sequelize.col("stock_minimo")
          },
          activo: true
        },
        order: [["stock", "ASC"]]
      });
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async sugerirReposicionFeria(req, res) {
    try {
      const desde = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
      
  
      const ventasFeria = await VentaProducto.findAll({
        include: [
          {
            model: Venta,
            as: "venta",
            where: {
              tipo: "feria",
              fecha: { [Op.gte]: desde },
            },
          },
          {
            model: Producto,
            as: "producto",
          },
        ],
      });
  
  
      const mapa = {};
  
      for (const vp of ventasFeria) {
        
  
        const id = vp.producto_id;
        if (!mapa[id]) {
          mapa[id] = {
            producto_id: id,
            nombre: vp.producto.nombre,
            stock_actual: vp.producto.stock,
            stock_minimo_actual: vp.producto.stock_minimo,
            vendidos_feria_90d: 0,
          };
        }
  
        mapa[id].vendidos_feria_90d += vp.cantidad;
      }
  
      const resultados = Object.values(mapa).map((p) => ({
        ...p,
        stock_minimo_sugerido: Math.ceil(p.vendidos_feria_90d / 3),
      }));
  
      res.json(resultados);
    } catch (error) {
      console.error("Error en sugerirReposicionFeria:", error);
      res.status(500).json({ error: error.message });
    }
  }
  
};
