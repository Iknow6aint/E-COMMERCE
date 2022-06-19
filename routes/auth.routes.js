const express = require('express')
const {
    getLogin,
    postLogin,
    getSignup,
    postSignup
} = require('../controllers/auth.controllers');
const User =require('../models/user.models')

const authRouter = express.Router();

authRouter.get('login',getLogin);
authRouter.post("/login",postLogin);
authRouter.get('/signup',getSignup);
authRouter.post('/signup',postSignup);

module.exports = authRouter;