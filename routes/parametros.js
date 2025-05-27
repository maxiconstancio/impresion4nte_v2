const express = require("express");
const router = express.Router();
const parametroController = require("../controllers/parametroController");

router.get("/", parametroController.getAll);
router.get("/:clave", parametroController.getByClave);
router.post("/", parametroController.upsert); // para crear o actualizar

module.exports = router;
