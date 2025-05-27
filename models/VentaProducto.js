module.exports = (sequelize, DataTypes) => {
    const VentaProducto = sequelize.define("VentaProducto", {
      venta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
    });
  
    VentaProducto.associate = function(models) {
      VentaProducto.belongsTo(models.Venta, {
        foreignKey: "venta_id",
        as: "venta"
      });
  
      VentaProducto.belongsTo(models.Producto, {
        foreignKey: "producto_id",
        as: "producto"
      });
    };
  
    return VentaProducto;
  };
  