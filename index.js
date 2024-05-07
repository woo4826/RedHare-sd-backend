const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');;
const app = express();

//Loading Routes
const router = require('./routes/route');
const loraRoutes = require('./routes/lora');
const sequelize = require('./config/database');
const errorController = require('./app/controllers/ErrorController');

env.config();
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
	next();
});

app.use(router);
app.use(loraRoutes);
app.use(errorController.pageNotFound);


sequelize
	//.sync({force : true})
	.sync()
	.then(() => {
		app.listen(process.env.PORT);
		//pending set timezone
		console.log( " ====================================== ");
		console.log("App listening on port " + process.env.PORT);
		console.log( " ====================================== ");
	})
	.catch(err => {
		console.log(err);
	});

