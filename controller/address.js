const Address = require('../model/Address')
const mongoose = require("mongoose");
const {verifyAuth} = require('./user');
const { body, validationResult } = require('express-validator');

exports.addAddr = (req, res) => {
    verifyAuth(req, res).then(decoded=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (decoded.auth !== false ) {

            let addr = new Address({
                addr: req.body.address,
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                user: decoded.data.data._id
            })

            addr.save().then((addr) => {
                res.status(200).send({
                    message: 'success',
                    address: addr
                })
            }).catch((err) => {
                res.status(500).send({
                    message: 'An error occured while creating the address',
                    result: err
                })
            })
        }
    })
}
exports.getAddr = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    verifyAuth(req, res).then(decoded=>{
        if (decoded.auth === true ) {
            let search = req.params.id
            Address.findOne()
                .or([{addr: search}, {name: search}])
                .then(addr => {
                    res.status(200).json(addr)
                })
                .catch(err =>{
                    res.status(500).send(err)
                })
        }else{
            res.status(401).send(decoded)
        }
    })
}
exports.updateAddr = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    verifyAuth(req, res).then(decoded=>{
        let search = req.params.id
        if (decoded.auth === true ) {
            Address.findOne()
                .or([{addr: search}, {name: search}])
                .then(addr => {
                    if (decoded.data.data._id == addr.user){
                        if (req.body.addr !== undefined && req.body.addr !== addr.addr)
                            addr.addr = req.body.address;
                        if (req.body.name !== undefined && req.body.name !== addr.name)
                            addr.name = req.body.name;
                        if (req.body.description !== undefined && req.body.description !== addr.description)
                            addr.description = req.body.description;
                        if (req.body.type !== undefined && req.body.type !== addr.type)
                            addr.type = req.body.type;
                        addr.save().then(saved=>{
                            res.status(200).json({message: "success", addr:saved})
                        }).catch(err => {
                            res.status(500).send(err)
                        })
                    }else{
                        res.status(401).send({message: "Unauthorized modification"})
                    }
                })
                .catch(err =>{
                    res.status(500).send(err)
                })
        }else{
            res.status(401).send(decoded)
        }
    })
}
exports.deleteAddr = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    verifyAuth(req, res).then(decoded=>{
        let search = req.params.id
        if (decoded.auth === true ) {
            Address.findOne()
                .or([{addr: search}, {name: search}])
                .then(addr => {
                    if (decoded.data.data._id == addr.user){
                        addr.delete().then(deleted=>{
                            res.status(200).json({message: "success", addr:deleted})
                        }).catch(err => {
                            res.status(500).send(err)
                        })
                    }else{
                        res.status(401).send({message: "Unauthorized modification"})
                    }
                })
                .catch(err =>{
                    res.status(500).send(err)
                })
        }else{
            res.status(401).send(decoded)
        }
    })
}
exports.getAllAddr = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    verifyAuth(req, res).then(decoded=>{
        if (decoded.auth === true ) {
            Address.find()
                .then(addr => {
                    res.status(200).json(addr)
                })
                .catch(err =>{
                    res.status(500).send(err)
                })
        }else{
            res.status(401).send(decoded)
        }
    })
}
