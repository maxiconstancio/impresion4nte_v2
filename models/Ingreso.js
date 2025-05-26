module.exports = (sequelize, DataTypes) => {
    const Ingreso = sequelize.define("Ingreso", {
      tipo: {
        type: DataTypes.STRING,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: DataTypes.STRING,
      },
      detalle: {
        type: DataTypes.TEXT,
      },
    });
  
    return Ingreso;
  };
  