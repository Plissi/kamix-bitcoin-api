const User = require('../model/Users');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config();

function generateToken(username){
    return jwt.sign({exp:3600,data:username}, process.env.TOKEN_SECRET);
}

function verifyAuth(req, res){
    let token = req.headers['x-access-token'];
    if (!token) return res.sendStatus(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) return res.sendStatus(500).json({ auth: false, message: 'Failed to authenticate token.' });

        res.sendStatus(200).json(decoded);
    })
}

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
            let token = generateToken(user.username);
            res.json({user: user});
        }
    }) )
}

exports.login = (req, res) =>{

    User.findOne()
        .or([{username:  req.body.username}, {email:  req.body.username}])
        .then((user)=>{
        if (!user) return res.status(404).send('No user found.');
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) return res.sendStatus(401).json({ auth: false, token: null });


        let token = generateToken(user.username);
        user.token = token
        user.save((err, doc)=>{
            if (err) return res.json({status: 500, message: err});
            res.json({ auth: true, token: token });
            })
        })
}

exports.read= (req, res) =>{

}

exports.update= (req, res) =>{

}

exports.delete= (req, res) =>{
    verifyAuth(req, res)
}
