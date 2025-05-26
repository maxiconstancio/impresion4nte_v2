module.exports = (sequelize, DataTypes) => {
    const Cuota = sequelize.define("Cuota", {
      numero_cuota: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      pagado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fecha_pago: {
        type: DataTypes.DATEONLY,
      },
    });
  
    Cuota.associate = function(models) {
      Cuota.belongsTo(models.Gasto, { foreignKey: "gasto_id" });
    };
  
    return Cuota;
  };
  