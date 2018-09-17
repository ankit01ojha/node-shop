const express  = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');

const productRoutes = require('./api/routes/product');
const orderRoutes = require('./api/routes/order');

mongoose.connect('mongodb://node-shop:ankitraja@node-rest-shop-shard-00-00-syxmb.mongodb.net:27017,node-rest-shop-shard-00-01-syxmb.mongodb.net:27017,node-rest-shop-shard-00-02-syxmb.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-shop-shard-0&authSource=admin&retryWrites=true',
						{
                            useNewUrlParser: true
						});

mongoose.Promise = global.Promise;
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) =>{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");

	if(req.method === 'OPTIONS'){
		res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH');
		return res.status(200).json({});
	}
	next();
});

// Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) =>{
	res.status(error.status || 500).json({
		eror:{
			message: error.message
		}
	})
})

module.exports = app;