'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      device_code: {
        type: Sequelize.STRING,
        unique: true
      },
      device_name: {
        type: Sequelize.STRING
      },
      device_type: {
        type: Sequelize.STRING
      },
      // status: {
      //   type: Sequelize.BOOLEAN
      // },
      user_id: {
        type: Sequelize.INTEGER
      },
      room_id: {                    // update
        type: Sequelize.INTEGER
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Devices');
  }
};