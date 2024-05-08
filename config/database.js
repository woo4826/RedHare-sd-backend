const Sequelize = require("sequelize");
const env = require("dotenv");
env.config();



//if prod mode use DB_HOST, DB_DATABASE, DB_PORT, DB_USERNAME, DB_PASSWORD from .env file
//if dev mode use DB_DEV_HOST, DB_DEV_DATABASE, DB_DEV_PORT, DB_DEV_USERNAME, DB_DEV_PASSWORD from .env file

if (process.env.NODE_ENV === "production") {
  var DB_HOST = process.env.DB_HOST;
  var DB_DATABASE = process.env.DB_DATABASE;
  // var DB_PORT = process.env.DB_PORT;
  var DB_USERNAME = process.env.DB_USERNAME;
  var DB_PASSWORD = process.env.DB_PASSWORD;
} else {
  var DB_HOST = process.env.DB_DEV_HOST;
  var DB_DATABASE = process.env.DB_DEV_DATABASE;
  // var DB_PORT = process.env.DB_DEV_PORT;
  var DB_USERNAME = process.env.DB_DEV_USERNAME;
  var DB_PASSWORD = process.env.DB_DEV_PASSWORD;
}

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  dialect: "mysql",
  host: DB_HOST,
});

module.exports = sequelize;

