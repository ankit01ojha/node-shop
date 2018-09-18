const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, (req, res, next) => {
	Order.find()
        .select('id product quantity')
        .populate('product', 'name')
        .exec()
        .then(data => {
            console.log(data);
            res.status(200).json({
                count: data.length,
                orders: data.map(data =>{
                    return {
                        _id: data._id,
                        product: data.product,
                        quantity: data.quatity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost/3001/orders/' + data._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error:err
            })
        })
});

router.post('/', checkAuth, (req, res, next) => {
            Product.findById(req.body.productId)
                .then(product => {
                    if(!product){
                        return res.status(404).json({
                            message: 'Incorrect productId, please check the productId'
                        });
                    }
                    const order = new Order({
                        _id: mongoose.Types.ObjectId(),
                        quantity: req.body.quantity,
                        product: req.body.productId
                    });
                    return order.save();
                })
                    .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            quanity: req.body.quantity,
                            product: req.body.productId
                        },
                        request : {
                            type: 'GET',
                            url: 'http://localhost:3001/orders' + result._id
                        }
                    });
                })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });

            });

router.get('/:orderId', checkAuth, (req, res, next) => {
	const id = req.params.orderId;
	Order.findById(id)
        .select('id product quantity')
        .populate('product')
        .exec()
        .then(data => {
            console.log(data);
                if(!data){
                    return res.status(404).json({
                        message: "Order not found"
                    })
                }
                res.status(200).json({
                    order: data,
                    request: {
                        description : 'To check all the products',
                        type : 'GET',
                        url: 'http://localhost:3001/orders'
                    }
                });


        })
        .catch(error => {
            res.status(500).json({
                error:err
            })
        })
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
	Order.remove({_id: req.params.orderId})
        .exec()
        .then(data => {
            res.status(200).json({
                message: "This order has been deleted",
                request: {
                    description : 'To create a new order',
                    type: 'POST',
                    url: 'http://locahost:3001/order',
                    body : { productId: 'ID', quantity: 'Number'}
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;