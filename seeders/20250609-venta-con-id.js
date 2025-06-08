'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const ventas = require('../seeders/ventas.json');
    const items = require('../seeders/items_venta.json');

    // Agrupar items por venta_id
    const agrupados = {};
    for (const item of items) {
      if (!agrupados[item.venta_id]) agrupados[item.venta_id] = [];
      agrupados[item.venta_id].push(item);
    }

    // Armar registros de ventas con total calculado
    const ventasConTotales = ventas.map(v => {
      const total = (agrupados[v.id] || []).reduce((acc, item) => {
        return acc + item.precio_unitario * item.cantidad;
      }, 0);

      return {
        id: v.id,
        fecha: new Date(v.fecha),
        metodo_pago: v.metodo_pago,
        tipo: v.tipo,
        total: total.toFixed(2),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('Venta', ventasConTotales, {});
  },

  async down(queryInterface, Sequelize) {
    const ventas = require('../seeders/ventas.json');
    const ids = ventas.map(v => v.id);
    await queryInterface.bulkDelete('Venta', { id: ids }, {});
  }
};
