'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Parametros', [
      {
        clave: 'precio_filamento_kg',
        valor: '5200',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clave: 'costo_hora_impresora',
        valor: '250',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clave: 'multiplicador_venta',
        valor: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clave: 'porcentaje_tarjeta',
        valor: '6',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Parametros', null, {});
  }
};
