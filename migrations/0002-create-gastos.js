'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Gastos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      monto_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      en_cuotas: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cantidad_cuotas: {
        type: Sequelize.INTEGER
      },
      proveedor_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Proveedors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Gastos');
  }
};
