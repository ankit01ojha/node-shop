const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');


router.get('/', (req, res, next) => {
		Product.find()
            .select('name price _id')
            .exec()
            .then(data => {
		        const response = {
		            count: data.length,
                    products: data.map(data => {
                        return{
                            name: data.name,
                            price: data.price,
                            _id: data._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3001/products/' + data._id
                            }
                        };
                    })
                };
		    res.status(200).json(response);

        }).catch(error => {
            console.log(error);
            res.status(500).json({
                error:err
            })
        });
});

router.post('/', (req, res, next) => {
		const product  = new Product({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			price: req.body.price
		});
		product.save().then(result =>{
			console.log(result);
			res.status(201).json({
                message: 'Product created successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: "GET",
                        url : "http://localhost:3001/products/" + result._id
                    }
                }
            })

		})
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error:err
                })
            } );

});

router.get('/:productId', (req, res, next) => {
		const id = req.params.productId;
		Product.findById(id)
            .select('name price _id')
            .exec()
            .then(data => {
                console.log('From Database',data);
                if(data){
                    res.status(200).json({
                        product: data,
                        request: {
                            type: 'GET',
                            description: "TO GET ALL PRODUCTS",
                            url: 'http://localhost:3001/products/'
                        }
                    });
                }else{
                    res.status(404).json({
                        message: "No entry found for this particular ID"
                    })
                }

            }).catch(err => {
            	console.log(err);
            	res.status(500).json({error:err});
        });
});

router.patch('/:productId', (req, res, next) => {
		const id = req.params.productId;
		const updateOps = {};
		for( const ops of req.body){
		  updateOps[ops.propName] = ops.value;
        };
		Product.update({_id: id}, {$set: updateOps} )
            .exec()
            .then(data => {
                res.status(200).json({
                    message: "Your product has been updated",
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3001/products/' + id
                    }
                });
            }).catch(error => {
                res.status(500).json({
                    error: err
                })
        })
});

router.delete('/:productId', (req, res, next) => {
        const id = req.params.productId;
		Product.remove({_id: id}).exec().then(data => {
		    res.status(200).json({
                message: "Product is deleted",
                request: {
                    type: 'POST',
                    url: 'http://localhost:3001/products',
                    body: {name: 'String', price: 'Number'}
                }
            });
        }).catch(error => {
            console.log(error);
            res.status(500).json({
                error:err
            })
        });
});

module.exports = router;