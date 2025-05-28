module.exports = (sequelize, DataTypes) => {
    const PedidoProducto = sequelize.define("PedidoProducto", {
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      observaciones: {
        type: DataTypes.TEXT,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL,
        allowNull: true, // porque los pedidos de productos reales ya tienen precio en Producto
      }
      
    });
  
    return PedidoProducto;
  };
  