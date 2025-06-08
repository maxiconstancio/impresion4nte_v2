const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");

router.post("/", pedidoController.crear);
router.get("/", pedidoController.listar);
router.get("/presupuestos", pedidoController.listarPresupuestos);
router.put("/:id", pedidoController.actualizarEstado);
router.put("/editar/:id", pedidoController.actualizarPresupuesto);
router.delete("/:id", pedidoController.eliminar)

module.exports = router;
