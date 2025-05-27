const fs = require("fs");
const csv = require("csv-parser");
const { Producto } = require("../models");

module.exports = {
  importarCSV: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const resultados = [];
    const errores = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        resultados.push(data);
      })
      .on("end", async () => {
        for (const fila of resultados) {
          try {
            const { nombre, descripcion, precio_unitario, stock } = fila;
            await Producto.create({
              nombre,
              descripcion,
              precio_unitario: parseFloat(precio_unitario),
              stock: parseInt(stock),
              activo: true
            });
          } catch (error) {
            errores.push({ fila, error: error.message });
          }
        }

        fs.unlinkSync(req.file.path); // borra el archivo temporal
        res.json({
          mensaje: "Importación finalizada",
          importados: resultados.length - errores.length,
          errores
        });
      });
  }
};
