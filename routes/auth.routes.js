const express = require('express')
const {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    logout,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword
} = require('../controllers/auth.controllers');
const User =require('../models/user.models')

const authRouter = express.Router();

authRouter.get('/login',getLogin);
authRouter.post("/login",postLogin);
authRouter.get('/signup',getSignup);
authRouter.post('/signup',postSignup);
authRouter.post("/logout",logout);
authRouter.get("/reset",getReset);
authRouter.post("/reset",postReset);
authRouter.get("/reset/:token",getNewPassword);
authRouter.post("/new-password",postNewPassword)



module.exports = authRouter;