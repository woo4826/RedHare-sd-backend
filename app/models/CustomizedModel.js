const {  DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CustomizedModel = sequelize.define('Customized_Model', {
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
        allowNull: false.valueOf,
        type: DataTypes.STRING
    }
},
{
});

module.exports = CustomizedModel;
