'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // one to many room with device 
      Room.hasMany(models.Device, {
        // as: 'devices',
        foreignKey: 'room_id'
      })
    }
  }
  Room.init({
    room_name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};