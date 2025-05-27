module.exports = (sequelize, DataTypes) => {
    const Parametro = sequelize.define("Parametro", {
      clave: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      valor: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    });
  
    return Parametro;
  };
  