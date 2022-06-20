const User = require('../models/user.models')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult}= require('express-validators')


const SEND_EMAIL =false;

function getLogin(req,res,next){
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: req.flash("error"),
        oldInput: { email: "", password: "" },
        validationErrors: [],
      });
    next()
};

function postLogin(req,res,next){
    const {email,password} = req.body;

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login',{
            path:'/login',
            pageTitle:'Login',
            errorMessage:errors.array()[0].msg,
            oldInput:{
                email,
                password
            },
            validationErrors:errors.array()
        })
    }

    User.findOne({email})
     .then((user)=>{
        if(!user){
            console.log('User is not found');
            return res.status(422).render('auth/login',{
                path:'/login',
                pageTitle:'Login',
                errorMessage:"invalid email or password",
                oldInput:{
                    email,
                    password
                },
                validationErrors:errors.array()
            })
        }
        bcrypt
         .compare(password, user.password)
         .then((doMatch)=>{
            if(doMatch){
                req.session.isLoggedIn=true;
                req.session.user = user;
                return req.session.save((err)=>{
                    console.log(err);
                    console.log("login success")
                    res.redirect("/")
                })
            }
            return res.status(422).render('auth/login',{
                path:'/login',
                pageTitle:'Login',
                errorMessage:errors.array()[0].msg,
                oldInput:{
                    email,
                    password
                },
                validationErrors:errors.array()
            })
         })
         .catch((err)=>{
            console.log(err);
            res.redirect("/login")
         })
     })
     .catch((err)=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)
     });
};

function getSignup(req,res,next){
    res.render('auth/signup',{
        pageTitle:"Sign Up",
        path:"/signup",
        errorMessage:req.flash("error"),
        oldInput:{
            email:"",
            password:"",
            confirmPassword:"",
        },
        validationErrors:[]
    })
};

function postSignup(req,res,next){
    const {email,password,confirmPassword}=req.body;
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/login',{
            path:'/signup',
            pageTitle:'Sign up',
            errorMessage:errors.array()[0].msg,
            oldInput:{
                email,
                password,
                confirmPassword:req.body.confirmPassword
            },
            validationErrors:errors.array()
        });
        
    }
    bcrypt
     .hash(password,12)
     .then((hashedPassword)=>{
        const user = new user({
            email,
            password:hashedPassword,
            cart:{
                items:[]
            }
        })
        return user.save()
     })
     .then((result)=>{
        res.redirect('/login');
        if(!SEND_EMAIL){
            return null;
        }
        // return transporter.sendMail({
        //     //RETUN MAIL
        //     to:email,
        //     from:"userMial@gmail.com",
        //     html:"<h1>Congrats you have signed up successfully</h1>"

        // })
     })
     .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
     })
}
function logout(req,res){
    req.session.destroy((err)=>{
        if(err){
            return console.log(err);
        }
        res.redirect('/')
    })
};

function getReset(req,res){
    req.render("auth/reset",{
        pageTitle:"Reset Password",
        path:'/reset',
        errorMessage:req.flash('error')
    })
};

function postReset(req,res,next){
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect("/reset");
        }
        const token =buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then((user)=>{
            if(!user){
                req.flash('error',"No account with this email found");
                return res.redirect('/reset');
            }
        })
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user
        .save()
        .then((result)=>{
            res.redirect("/")
        })
    })
    .catch((err)=>{
        const error =new Error(err);
        error.httpStatusCode = 500
    })
};

function getNewPassword(req, res, next){
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
      .then((user) => {
        res.render("auth/new-password", {
          path: "/new-password",
          pageTitle: "New Password",
          errorMessage: req.flash("error"),
          userId: user._id.toString(),
          passwordToken: token,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

function postNewPassword(req,res,next){
    const newPassword =req.body.password;
    const userId = req.body.userId;
    const passwordToken =req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration:{$gt: Date.now()},
        _id:userId,
    })
    .then((user)=>{
        resetUser =user;
        return bcrypt.hash(newPassword,12);

    })
    .then((hashedPassword) => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then((result)=>{
        res.redirect("/login")
    })
    .catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode =500;
        return next(error);
    });
};
  



module.exports ={
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    logout,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword
}