'use strict';

const path = require("path");
const fs = require("fs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const items = require(path.join(__dirname, "../seeders/items_venta.json"));
    const ventas_json = require(path.join(__dirname, "../seeders/ventas.json"));

    const ventas_json_ids = new Set(ventas_json.map(v => v.id));

    const ventas_en_db = await queryInterface.sequelize.query(
      'SELECT id FROM "Ventas";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const ventas_db_ids = new Set(ventas_en_db.map(v => v.id));

    const ventas_validas = [...ventas_json_ids].filter(id => ventas_db_ids.has(id));
    const ids_validos = new Set(ventas_validas);

    const datos_filtrados = items
      .filter(item => ids_validos.has(item.venta_id))
      .map(item => ({
        venta_id: item.venta_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    console.log(`Insertando ${datos_filtrados.length} ítems de venta válidos...`);
    await queryInterface.bulkInsert('VentaProductos', datos_filtrados, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('VentaProductos', null, {});
  }
};
