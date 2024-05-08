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
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    }
},
{
});

module.exports = CustomizedModel;
