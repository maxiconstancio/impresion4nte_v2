const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/", dashboardController.getResumen);
router.get("/mensual", dashboardController.getResumenMensual);
router.get("/completo", dashboardController.getResumenCompleto);
router.get("/resumen-mensual-financiero", dashboardController.getResumenMensualFinanciero);

module.exports = router;
