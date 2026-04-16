module.exports = (sequelize, DataTypes) => {
  const EnergyReading = sequelize.define("EnergyReading", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false
    },

    price_eur_mwh: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    source: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ["timestamp", "location"]
      }
    ],
    timestamps: false // 🔥 väga oluline (väldib createdAt errorit)
  });

  return EnergyReading;
};