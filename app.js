const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Router Handler
const productsRoutes = require('./api/Routes/products.js');
const ordersRoutes = require('./api/Routes/orders.js');

//connecting to a remote mongodb
mongoose.connect('mongodb://root:'+process.env.MONGO_PASS+'@cluster0-shard-00-00-eif8a.mongodb.net:27017,cluster0-shard-00-01-eif8a.mongodb.net:27017,cluster0-shard-00-02-eif8a.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin', 
{
    useMongoClient: true
});

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// allowing cross origin resource sharing
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');// the '*' allow anyone to access this api (change in production);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTION'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
        return res.status(200).json({});
    }
    next();
});

//Routes witch should handle requests
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);

//Not Found Error Handler
app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

//Global Error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;