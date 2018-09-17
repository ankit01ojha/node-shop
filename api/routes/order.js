const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Order.find()
        .select('id product quantity')
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

router.post('/', (req, res, next) => {
            Product.findById(req.body.productId)
                .then(product => {
                    const order = new Order({
                        _id: mongoose.Types.ObjectId(),
                        quantity: req.body.quantity,
                        product: req.body.productId
                    });
                    return order.save().then(result => {
                        console.log(result);
                        res.status(201).json({result});
                    })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            })
                        })

                    });
                })
                .catch( error => {
                    res.status(500).json({
                        message: "Product Not Found",
                        error: err
                    })
                });


router.get('/:orderId', (req, res, next) => {
	const id = req.params.orderId;
	Order.find(id)
        .select('id product quantity')
        .exec()
        .then(data => {
            console.log(data);
            res.status(200).json(data);
        })
        .catch(error => {
            res.status(500).json({
                error:err
            })
        })
});

router.delete('/:orderId', (req, res, next) => {
	res.status(200).json({
		message: "This order is being deleted",
		orderId: req.params.orderId
	});	
});


module.exports = router;