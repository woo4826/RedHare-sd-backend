const {  DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CMProcessing = sequelize.define('CMProcessing', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
},
user_id: {
  type: DataTypes.INTEGER,
  allowNull: false
},
independent_key: {
    type: DataTypes.STRING,
    allowNull: false
},
status: {
    type: DataTypes.STRING,
    allowNull: false
}
}, {
});

module.exports = CMProcessing;
