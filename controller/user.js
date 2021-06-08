const User = require('../model/Users');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const {validationResult} = require("express-validator");
dotenv.config();

function generateToken(user){
    return jwt.sign({
        exp:Math.floor(Date.now() / 1000) + (60 * 60 * 2),
        data: {
            _id: user._id,
            password: user.password
        }
    }, process.env.TOKEN_SECRET);
}

function verifyAuth(req, res){
    return new Promise(resolve=>{
        let token = req.headers['x-access-token'];
        if (!token)  resolve({auth: false, message: 'No token provided.'});
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) resolve({auth: false, message: 'Failed to authenticate token.'});
            resolve({auth: true, data: decoded});
        })
    })
}
exports.verifyAuth = verifyAuth;

exports.register= async(req, res) =>{
    let salt =  bcrypt.genSaltSync(8) ;
    let pass =  bcrypt.hashSync( req.body.password, salt)
    console.log('creating')
    await new User({
        firstname: req.body.firstname,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: pass
    }).save( ((err, user) => {
        if (err) {
            console.log(err)
            return res.json({status: 500, message: "There was a problem registering the user."});
        }else {
            let token = generateToken(user);
            res.json({user: user});
        }
    }) )
}

exports.login = (req, res) =>{

    User.findOne()
        .or([{username:  req.body.username}, {email:  req.body.username}])
        .then((user)=>{
        if (!user) return res.status(401).send('No user found.');
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });


        let token = generateToken(user);
        user.token = token
        user.save((err, doc)=>{
            if (err) return res.json({status: 500, message: err});
            res.json({ auth: true, token: token, user: user });
            })
        })
}

exports.logout =(req, res)=>{
    verifyAuth(req, res).then(decoded=>{
        if (decoded.auth !== false ){
            User.findById(decoded.data.data._id).then(user=>{
                user.token = null;
                user.save((err, doc) => {
                    if (err) return res.status(500).send({err: err});
                    return res.status(200).send({message: "success"})
                })
            })
        }else{

        }
    })
}

exports.read= (req, res) =>{

}

exports.changePass= (req, res) =>{
    verifyAuth(req, res).then(decoded=>{
        if (decoded.auth === true ) {
            let new_pass = req.body.new_password;
            let old_pass = req.body.old_password;
            User.findById(decoded.data.data._id)
                .then(user => {
                    let passwordIsValid = bcrypt.compareSync(old_pass, user.password)
                    if (!passwordIsValid) return res.status(401).send({ message: "wrong password" });

                    let salt =  bcrypt.genSaltSync(8) ;
                    let pass =  bcrypt.hashSync(new_pass, salt);
                    user.password = pass;

                    user.save((err, user) => {
                        if(err) return res.status(500).send({ message: "password not saved" });
                        res.status(200).json({ message: "success", user:user })
                    })
                })
                .catch(err =>{
                    res.status(500).send({err: err})
                })
        }else{
            res.status(401).send(decoded)
        }
    })
}

exports.update= (req, res) =>{
    /*const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }*/
    verifyAuth(req, res).then(decoded=>{
        let name = req.body.name;
        let username = req.body.username;
        let email = req.body.email;

        if (decoded.auth === true ) {
            User.findById(decoded.data.data._id)
                .then(user => {
                    if(name !== undefined && name !== user.name){
                        user.name = name
                    }
                    if(username !== undefined && username !== user.username){
                        user.username = username
                    }
                    if(email !== undefined && email !== user.email){
                        user.email = email
                    }
                    user.save((err, doc) => {
                        if (err) return res.status(500).send({err: err});
                        return res.status(200).json({message: "success", user:doc});
                    })
                })
                .catch(err =>{
                    res.status(500).send({err: err})
                })
        }else{
            res.status(401).send({message: "Unauthorized modification", decoded: decoded})
        }
    })
}

exports.delete= (req, res) =>{

}
