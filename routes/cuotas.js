const express = require("express");
const router = express.Router();
const cuotasController = require("../controllers/cuotasController");

router.get("/", cuotasController.getAll);
router.get("/proximas", cuotasController.getProximas);
router.get("/:id", cuotasController.getById);
router.put("/:id", cuotasController.update);
router.delete("/:id", cuotasController.remove);

module.exports = router;
