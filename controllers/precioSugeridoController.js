const db = require("../models");
const PrecioSugerido = db.PrecioSugerido;

exports.guardarPrecioSugerido = async (req, res) => {
  try {
    const nuevo = await PrecioSugerido.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al guardar precio sugerido:", error);
    res.status(500).json({ error: "Error al guardar el precio sugerido" });
  }
};