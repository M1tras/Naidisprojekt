'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('EnergyReadings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('EnergyReadings');
  }
};
await queryInterface.addIndex('EnergyReadings', ['timestamp', 'location'], {
  unique: true
});