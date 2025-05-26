const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/", dashboardController.getResumen);
router.get("/mensual", dashboardController.getResumenMensual);

module.exports = router;
