// /models/PrecioSugerido.js

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("PrecioSugerido", {
    nombre: {
      type: DataTypes.STRING,
    },
    peso: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tiempo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precioCalculado: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    precioKilo: {
      type: DataTypes.FLOAT,
    },
    costoHoraImpresora: {
      type: DataTypes.FLOAT,
    },
    multiplicador: {
      type: DataTypes.FLOAT,
    },
  });
};

