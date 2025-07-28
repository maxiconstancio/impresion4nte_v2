const { Producto, VentaProducto, Venta } = require("../models");
const { Op, Sequelize } = require("sequelize");
const visionService = require("../services/visionService");
const vectorService = require("../services/vectorService");
const localClipService = require("../services/localClipService.js");

const axios = require('axios');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

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
  async getAllPedido(req, res) {
    try {
      const { search } = req.query;

      const where = {};

      if (search && search.length >= 3) {
        where[Op.and] = [
          { activo: true },
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
      // 1️⃣ Crear el producto normalmente con los datos del body
      const producto = await Producto.create(req.body);
  
      // 2️⃣ Si tiene image_url, genera etiquetas con image-classification
      if (producto.image_url) {
        try {
          const embedding = await localClipService.generateImageEmbedding(producto.image_url);
          producto.embedding = embedding;
          await producto.save();
          console.log(`✅ Etiquetas generadas para producto ID=${producto.id}`);
        } catch (error) {
          console.error(`❌ Error generando etiquetas: ${error.message}`);
          // No lanzamos error para no romper la creación del producto
        }
      }
  
      // 3️⃣ Devolver respuesta
      res.status(201).json(producto);
  
    } catch (error) {
      console.error(error);
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
  async getStockValorizado(req, res) {
    try {
      const productos = await Producto.findAll({
        attributes: ["id", "nombre", "stock", "precio_unitario"],
        where: {
          activo: true,
          stock: { [Op.gt]: 0 }
        },
        order: [["nombre", "ASC"]]
      });
  
      const valorizado = productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        precio_unitario: parseFloat(p.precio_unitario),
        valor_total: parseFloat(p.precio_unitario) * p.stock
      }));
  
      const total = valorizado.reduce((acc, p) => acc + p.valor_total, 0);
  
      res.json({ productos: valorizado, total });
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
                     categoria: vp.producto.categoria || "General",  // <— guardo categoría
                      stock_actual: vp.producto.stock,
                      stock_minimo_actual: vp.producto.stock_minimo,
                      vendidos_feria_90d: 0,
                   };
                  }
  
        mapa[id].vendidos_feria_90d += vp.cantidad;
      }
  
            const resultados = Object.values(mapa).map((p) => ({
                producto_id: p.producto_id,
                nombre: p.nombre,
                categoria: p.categoria,                         // <— incluyo categoría en la respuesta
                stock_actual: p.stock_actual,
                stock_minimo_actual: p.stock_minimo_actual,
                vendidos_feria_90d: p.vendidos_feria_90d,
                stock_minimo_sugerido: Math.ceil(p.vendidos_feria_90d / 3),
              }));
  
      res.json(resultados);
    } catch (error) {
      console.error("Error en sugerirReposicionFeria:", error);
      res.status(500).json({ error: error.message });
    }
  },
  searchByPhoto: async (req, res) => {
    try {
      const { imageUrl } = req.body;
  
      // 1️⃣ Describir la imagen usando GPT-4o Vision
      const description = await visionService.describeImage(imageUrl);
  
      // 2️⃣ Generar embedding de la descripción
      const embedding = await visionService.generateEmbedding(description);
  
      // 3️⃣ Buscar similitud en Pinecone
      const match = await vectorService.searchVector(embedding);
  
      // 4️⃣ Buscar producto en la DB local usando el ID que devuelve Pinecone
      const producto = await Producto.findOne({
        where: { id: match.id },
      });
  
      res.json({ 
        description, 
        match: producto, 
        score: match.score 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  searchByPhotoLocal: async (req, res) => {
    try {
      // ✅ Si envías imagen como archivo, estará en req.file
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ error: "Falta el archivo de imagen" });
      }
  
      // 1️⃣ Preparar FormData para enviar a visionService.py
      const form = new FormData();
      form.append('file', file.buffer, { filename: file.originalname });
      
      const visioUrl  = (process.env.VISION_SERVICE_URL + '/describe_and_embed') || 'http://vision:8000/describe_and_embed'
      
      // 2️⃣ POST a visionService local
      const visionResp = await axios.post(
        visioUrl ,
        form,
        { headers: form.getHeaders() }
      );
  
      const { description, embedding } = visionResp.data;
  
      // 3️⃣ Traer productos de DB y calcular similitud
      const productos = await Producto.findAll({
        where: {
          embedding: { [Op.ne]: null }
        }
      });
  
      const resultados = [];
  
      for (const producto of productos) {
        let productEmbedding = producto.embedding;
        if (typeof productEmbedding === 'string') {
          productEmbedding = JSON.parse(productEmbedding);
        }
  
        const score = cosineSimilarity(embedding, productEmbedding);
  
        resultados.push({
          producto,
          score
        });
      }
  
      resultados.sort((a, b) => b.score - a.score);
  
      res.json({
        description,
        // match: resultados[0] || null
        matches: resultados.slice(0, 3)
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  
  
  
  
  
};

function cosineSimilarity(a, b) {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}