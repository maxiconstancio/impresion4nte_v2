const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const productoController = require("../controllers/productoController");


router.get("/", productoController.getAll);
router.post("/", productoController.create);
router.get("/stock-pedidos", productoController.getAllPedido);
router.get("/reposicion", productoController.getProductosReposicion);
router.post("/recomendar-precio", productoController.recomendarPrecio);

router.get("/sugerir-reposicion-feria", productoController.sugerirReposicionFeria);
router.get("/stock-valorizado", productoController.getStockValorizado);
router.post("/search-by-photo", productoController.searchByPhoto);
router.post("/search-by-photo-local",
    upload.single('file'),
     productoController.searchByPhotoLocal);
router.get("/:id", productoController.getById);
router.put("/:id", productoController.update);
router.delete("/:id", productoController.remove);

module.exports = router;
