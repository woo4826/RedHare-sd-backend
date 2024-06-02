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
    },
    thumbnail_image: {
        allowNull: true.valueOf,
        type: DataTypes.STRING
    },
    cm_nickname: {
        allowNull: true.valueOf,
        type: DataTypes.STRING
    },
    status: {
        allowNull: false.valueOf,
        type: DataTypes.STRING
    },
    createdAt: {
        allowNull: false.valueOf,
        type: DataTypes.DATE
    },
    updateAt: {
        allowNull: false.valueOf,
        type: DataTypes.DATE
    }
},
{
});

module.exports = CustomizedModel;
