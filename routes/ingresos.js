const express = require("express");
const router = express.Router();
const ingresosController = require("../controllers/ingresosController");

router.get("/", ingresosController.getAll);
router.get("/:id", ingresosController.getById);
router.post("/", ingresosController.create);
router.put("/:id", ingresosController.update);
router.delete("/:id", ingresosController.remove);

module.exports = router;
