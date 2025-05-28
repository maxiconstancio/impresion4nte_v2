
  module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define("Pedido", {
      cliente: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente",
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      comentarios: {
        type: DataTypes.TEXT,
      },
    });
  
    Pedido.associate = (models) => {
      Pedido.belongsToMany(models.Producto, {
        through: models.PedidoProducto,
        foreignKey: "pedidoId",
      });
    };
  
    return Pedido;
  };
    