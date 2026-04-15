module.exports = (sequelize, DataTypes) => {
  return sequelize.define("EnergyReading", {
    timestamp: {
    type: DataTypes.DATE,
    allowNull: false
    },
    location: DataTypes.STRING,
    price_eur_mwh: DataTypes.FLOAT,
    source: DataTypes.STRING,
    price_eur_mwh: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING
    }
  });
};