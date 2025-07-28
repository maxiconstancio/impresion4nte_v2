'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Productos', 'categoria', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'General',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'categoria');
  }
};
