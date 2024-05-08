const {  DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CMProcessing = sequelize.define('CMProcessing', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
});

module.exports = CMProcessing;
