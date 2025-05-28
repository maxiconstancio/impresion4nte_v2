'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Ventas', 'fecha', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Ventas', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  }
};