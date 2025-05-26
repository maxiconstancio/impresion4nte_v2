const { Gasto, Ingreso, Cuota } = require("../models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    async getResumenMensual(req, res)  {
        try {
          const ingresosMensuales = await sequelize.query(`
            SELECT
              TO_CHAR(fecha, 'YYYY-MM') AS mes,
              SUM(monto) AS ingresos
            FROM "Ingresos"
            GROUP BY mes
            ORDER BY mes
          `, { type: sequelize.QueryTypes.SELECT });
      
          const gastosMensuales = await sequelize.query(`
            SELECT
              TO_CHAR(fecha, 'YYYY-MM') AS mes,
              SUM(monto_total) AS gastos
            FROM "Gastos"
            GROUP BY mes
            ORDER BY mes
          `, { type: sequelize.QueryTypes.SELECT });
      
          // Unificamos en una sola respuesta
          const resultado = {};
      
          ingresosMensuales.forEach(({ mes, ingresos }) => {
            if (!resultado[mes]) resultado[mes] = { mes, ingresos: 0, gastos: 0 };
            resultado[mes].ingresos = parseFloat(ingresos);
          });
      
          gastosMensuales.forEach(({ mes, gastos }) => {
            if (!resultado[mes]) resultado[mes] = { mes, ingresos: 0, gastos: 0 };
            resultado[mes].gastos = parseFloat(gastos);
          });
      
          const resumenMensual = Object.values(resultado).sort((a, b) => a.mes.localeCompare(b.mes));
      
          res.json(resumenMensual);
      
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
  async getResumen(req, res) {
    try {
      const { desde, hasta } = req.query;

      const fechaFiltro = {};
      if (desde && hasta) {
        fechaFiltro.fecha = {
          [Op.between]: [desde, hasta]
        };
      } else if (desde) {
        fechaFiltro.fecha = {
          [Op.gte]: desde
        };
      } else if (hasta) {
        fechaFiltro.fecha = {
          [Op.lte]: hasta
        };
      }

      const totalIngresos = await Ingreso.sum("monto", {
        where: fechaFiltro
      }) || 0;

      const totalGastos = await Gasto.sum("monto_total", {
        where: fechaFiltro
      }) || 0;

      const totalCuotasPagadas = await Cuota.sum("monto", {
        where: {
          pagado: true,
          ...(fechaFiltro.fecha ? { fecha_vencimiento: fechaFiltro.fecha } : {})
        }
      }) || 0;

      const totalCuotasPendientes = await Cuota.sum("monto", {
        where: {
          pagado: false,
          ...(fechaFiltro.fecha ? { fecha_vencimiento: fechaFiltro.fecha } : {})
        }
      }) || 0;

      const totalNeto = totalIngresos - totalGastos;

      res.json({
        totalIngresos,
        totalGastos,
        totalCuotasPagadas,
        totalCuotasPendientes,
        totalNeto
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
