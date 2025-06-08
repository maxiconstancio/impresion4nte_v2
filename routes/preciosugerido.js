const express = require("express");
const router = express.Router();
const precioSugeridoController = require("../controllers/precioSugeridoController");


router.post("/", precioSugeridoController.guardarPrecioSugerido);

module.exports = router;



