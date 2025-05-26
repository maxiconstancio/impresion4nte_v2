const express = require("express");
const router = express.Router();
const gastosController = require("../controllers/gastosController");

router.get("/", gastosController.getAll);
router.get("/:id", gastosController.getById);
router.post("/", gastosController.create);
router.put("/:id", gastosController.update);
router.delete("/:id", gastosController.remove);

module.exports = router;