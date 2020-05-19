var express = require('express')
var app = express();
const JWT = require('jsonwebtoken')
app.use(express.json()) // for json body

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const passport = require('passport')
require('./passport');

const { jwtSecret } = require('./config')

const passportJwt = passport.authenticate('jwt', {session: false})

const userService = require('./services/userService')

const signToken = (user) =>{
    return JWT.sign({
        iss: 'express_passport',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().getTime() + 3600 // 1 hour after issuance
    },
    jwtSecret
    )
}

app.post('/register', async (req, res) =>{
    try{
        const registered = await userService.find({email: req.body.email})
        if(!registered){
            const createdUser = await userService.create(req.body)
            res.send(createdUser)
        }else{
            res.send('user already present').status(500)
        }
    }catch(e){
        res.send('Some Err:', e).status(500)
    }
    
})

app.post('/login', async (req, res) =>{
    try{
        const user = await userService.authenticate({email: req.body.email}, req.body.password)
        if(user){
            const signedToken = signToken(user)
            res.send({token : signedToken})
        }else{
            res.send('Invalid email or password').status(500)
        }
    }catch(e){
        res.send('Some Err:', e).status(500)
    }
    
})

app.get('/profile', passportJwt, (req, res) => {
    res.send(req.user)
})


const port =  5000;
const host = 'localhost'

try{
    app.listen(port, host)
}catch(e){
    console.error('Unable to start server:', e)
}