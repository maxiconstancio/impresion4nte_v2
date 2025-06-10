const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");

router.get("/", ventaController.getAll);
router.get("/ranking", ventaController.rankingProductos);
router.get("/por-hora", ventaController.ventasPorHora);
router.post("/", ventaController.create);
router.get("/:id", ventaController.getById);
router.put("/:id", ventaController.update);
router.delete("/:id", ventaController.delete);

module.exports = router;
