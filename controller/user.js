const User = require('../model/Users');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
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
            User.findById(decoded.data._id).then(user=>{
                user.token = null;
                user.save()
            })
        }else{

        }
    })
}

exports.read= (req, res) =>{

}

exports.update= (req, res) =>{

}

exports.delete= (req, res) =>{

}
