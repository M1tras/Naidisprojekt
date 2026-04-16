'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EnergyReadings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },

      location: {
        type: Sequelize.STRING,
        allowNull: false
      },

      price_eur_mwh: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      source: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await queryInterface.addIndex("EnergyReadings", ["timestamp", "location"], {
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EnergyReadings");
  }
};