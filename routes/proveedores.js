const express = require("express");
const router = express.Router();
const proveedoresController = require("../controllers/proveedoresController");

router.get("/", proveedoresController.getAll);
router.post("/", proveedoresController.create);

module.exports = router;
