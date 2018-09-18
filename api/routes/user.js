const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signUp', (req, res, next) => {
    User.find({email:req.body.email}).exec()
        .then(result => {
            if(result.length>=1){
                return res.status(409).json({
                    message : "User already exists"
                });
            }
            else{
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error:err
                        })
                    }else{
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "user created"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                })

            }
        });
});

router.post('/login', (req, res, next) => {
   User.findOne({email: req.body.email})
       .exec()
       .then(user => {
           if(user.length <1){
               res.status(401).json({
                   message: "Auth Failed"
               })
           }
           bcrypt.compare(req.body.password, user.password, (err, result) => {
               if(err){
                   return res.status(401).json({
                       message: "Auth Failed"
                   });
               }
               if(result){
                   const token = jwt.sign({
                       email : user.email,
                       userid: user._id
                   },
                       'secret',
                       {
                           expiresIn: "1h"
                       });
                   return res.status(200).json({
                       message: "Auth successful",
                       token : token
                   });
               }
               return res.status(401).json({
                   message: "Auth Failed"
               });
           })
       })
       .catch(err => {
           console.log(err);
           res.status(500).json({
               error: err
           });
       });
});

router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId;
    User.remove({_id:id}).exec()
        .then(result => {
            res.status(200).json({
                message: "user deleted"
            })
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error:err
            })
        });
})



module.exports = router;