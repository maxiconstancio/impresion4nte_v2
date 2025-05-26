module.exports = (sequelize, DataTypes) => {
    const Gasto = sequelize.define("Gasto", {
      tipo: {
        type: DataTypes.STRING,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      monto_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      en_cuotas: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cantidad_cuotas: {
        type: DataTypes.INTEGER,
      },
    });
  
    Gasto.associate = function(models) {
      Gasto.belongsTo(models.Proveedor, { foreignKey: "proveedor_id" });
      Gasto.hasMany(models.Cuota, { foreignKey: "gasto_id", onDelete: 'CASCADE' });
    };
  
    return Gasto;
  };
  