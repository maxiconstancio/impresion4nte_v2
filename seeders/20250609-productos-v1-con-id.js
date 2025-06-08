'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const productos = require('../seeders/productos.json');

    await queryInterface.bulkInsert('Productos', productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio_unitario: parseFloat(p.precio_unitario),
      stock: parseInt(p.stock),
      stock_minimo: parseInt(p.stock_minimo),
      activo: p.activo,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down(queryInterface, Sequelize) {
    const ids = require('../seeders/productos.json').map(p => p.id);
    await queryInterface.bulkDelete('Productos', { id: ids }, {});
  }
};
