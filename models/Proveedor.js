module.exports = (sequelize, DataTypes) => {
    const Proveedor = sequelize.define("Proveedor", {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
      },
      contacto: {
        type: DataTypes.TEXT,
      },
    });
  
    Proveedor.associate = function(models) {
      Proveedor.hasMany(models.Gasto, { foreignKey: "proveedor_id" });
    };
  
    return Proveedor;
  };
  