module.exports = (sequelize, DataTypes) => {
    const Venta = sequelize.define("Venta", {
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      metodo_pago: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
    });
  
    Venta.associate = function(models) {
      Venta.hasMany(models.VentaProducto, {
        foreignKey: "venta_id",
        as: "productos"
      });
    };
  
    return Venta;
  };
  