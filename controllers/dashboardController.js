const { Gasto, Ingreso, Cuota, Venta } = require("../models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async getResumenMensual(req, res) {
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

  async getResumenMensualFinanciero(req, res) {
    try {
      const hoy = new Date();
      const inicioFiltro = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1); // desde hace 2 meses (3 en total incluyendo el actual)
      const desde = inicioFiltro.toISOString().split("T")[0]; // YYYY-MM-DD
  
      const [ventas, ingresos, cuotas, gastosSimples] = await Promise.all([
        sequelize.query(`
          SELECT TO_CHAR("createdAt", 'YYYY-MM') AS mes, SUM(total) AS monto
          FROM "Venta"
          WHERE "createdAt" >= '${desde}'
          GROUP BY mes
        `, { type: sequelize.QueryTypes.SELECT }),
  
        sequelize.query(`
          SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, SUM(monto) AS monto
          FROM "Ingresos"
          WHERE fecha >= '${desde}'
          GROUP BY mes
        `, { type: sequelize.QueryTypes.SELECT }),
  
        sequelize.query(`
          SELECT TO_CHAR(fecha_vencimiento, 'YYYY-MM') AS mes, SUM(monto) AS monto
          FROM "Cuota"
          WHERE  fecha_vencimiento >= '${desde}'
          GROUP BY mes
        `, { type: sequelize.QueryTypes.SELECT }),
  
        sequelize.query(`
          SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, SUM(monto_total) AS monto
          FROM "Gastos"
          WHERE en_cuotas = false AND fecha >= '${desde}'
          GROUP BY mes
        `, { type: sequelize.QueryTypes.SELECT }),
      ]);
  
      const resumen = {};
  
      ventas.forEach(({ mes, monto }) => {
        if (!resumen[mes]) resumen[mes] = { mes, ingresos: 0, gastos: 0, neto: 0 };
        resumen[mes].ingresos += parseFloat(monto);
      });
  
      ingresos.forEach(({ mes, monto }) => {
        if (!resumen[mes]) resumen[mes] = { mes, ingresos: 0, gastos: 0, neto: 0 };
        resumen[mes].ingresos += parseFloat(monto);
      });
  
      cuotas.forEach(({ mes, monto }) => {
        if (!resumen[mes]) resumen[mes] = { mes, ingresos: 0, gastos: 0, neto: 0 };
        resumen[mes].gastos += parseFloat(monto);
      });
  
      gastosSimples.forEach(({ mes, monto }) => {
        if (!resumen[mes]) resumen[mes] = { mes, ingresos: 0, gastos: 0, neto: 0 };
        resumen[mes].gastos += parseFloat(monto);
      });
  
      Object.values(resumen).forEach((r) => {
        r.neto = r.ingresos - r.gastos;
      });
  
      const resultado = Object.values(resumen).sort((a, b) => a.mes.localeCompare(b.mes));
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  ,

  async getResumenCompleto(req, res) {
    try {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const ingresosTotales = await Ingreso.sum("monto") || 0;
      const ingresosMes = await Ingreso.sum("monto", {
        where: {
          fecha: {
            [Op.between]: [inicioMes, finMes],
          },
        },
      }) || 0;

      const ventasTotales = await Venta.sum("total") || 0;
      const ventasMes = await Venta.sum("total", {
        where: {
          fecha: {
            [Op.between]: [inicioMes, finMes],
          },
        },
      }) || 0;

      const totalIngresos = ingresosTotales + ventasTotales;
      const ingresosDelMes = ingresosMes + ventasMes;

      // Cuotas pagadas este mes
      const cuotasPagadasEsteMes = await Cuota.sum("monto", {
        where: {
          pagado: true,
          fecha_vencimiento: {
            [Op.between]: [inicioMes, finMes],
          },
        },
      }) || 0;

      // Cuotas vencen este mes y aún no fueron pagadas
      const cuotasNoPagadasEsteMes = await Cuota.sum("monto", {
        where: {
          pagado: false,
          fecha_vencimiento: {
            [Op.between]: [inicioMes, finMes],
          },
        },
      }) || 0;

      // Gastos únicos sin cuotas, registrados este mes
      const gastosSimplesEsteMes = await Gasto.sum("monto_total", {
        where: {
          en_cuotas: false,
          fecha: {
            [Op.between]: [inicioMes, finMes],
          },
        },
      }) || 0;

      const gastosMes = cuotasPagadasEsteMes + cuotasNoPagadasEsteMes + gastosSimplesEsteMes;

      const totalCuotasPagadas = await Cuota.sum("monto", {
        where: { pagado: true },
      }) || 0;

      const totalCuotasPendientes = await Cuota.sum("monto", {
        where: { pagado: false },
      }) || 0;

      const netoMes = ingresosDelMes - gastosMes;

      res.json({
        ingresosTotales: totalIngresos,
        ingresosMes: ingresosDelMes,
        gastosMes,
        netoMes,
        totalCuotasPagadas,
        totalCuotasPendientes,
      });

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

      const totalGastos = totalCuotasPagadas;
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
