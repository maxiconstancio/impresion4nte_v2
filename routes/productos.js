const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");

router.get("/", productoController.getAll);
router.post("/", productoController.create);
router.get("/reposicion", productoController.getProductosReposicion);
router.post("/recomendar-precio", productoController.recomendarPrecio);
router.get("/:id", productoController.getById);
router.put("/:id", productoController.update);
router.delete("/:id", productoController.remove);

module.exports = router;
