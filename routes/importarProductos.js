const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const importarProductosController = require("../controllers/importarProductosController");

const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.post("/", upload.single("archivo"), importarProductosController.importarCSV);

module.exports = router;