module.exports = (sequelize, DataTypes) => {
    const Producto = sequelize.define("Producto", {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    });
  
    Producto.associate = function(models) {
      // Futuras asociaciones con VentaProducto
    };
  
    return Producto;
  };
  