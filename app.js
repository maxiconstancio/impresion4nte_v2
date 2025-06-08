require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./models");
const gastosRoutes = require("./routes/gastos");
const ingresosRoutes = require("./routes/ingresos");
const proveedoresRoutes = require("./routes/proveedores");
const cuotasRoutes = require("./routes/cuotas");
const dashboardRoutes = require("./routes/dashboard");
const productosRoutes = require("./routes/productos");
const parametroRoutes = require("./routes/parametros");
const ventasRoutes = require("./routes/ventas");
const importarProductosRoutes = require("./routes/importarProductos");
const preciosugeridoRoutes = require("./routes/preciosugerido");

const cors = require("cors");

app.use(cors());
app.use(express.json());

// Rutas base (por ahora vacío)
app.get("/", (req, res) => {
  res.send("API Impresion4nte v2 corriendo...");
});

app.use("/api/gastos", gastosRoutes);
app.use("/api/ingresos", ingresosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/cuotas", cuotasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/parametros", parametroRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/productos/importar", importarProductosRoutes);
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/preciosugerido", preciosugeridoRoutes);
// Sincronizar base de datos y levantar servidor
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
  });
});
