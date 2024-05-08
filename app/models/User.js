const bcrypt = require('bcryptjs');
const {  DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: true
		}
  	},
	);



module.exports = User;