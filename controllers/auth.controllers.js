const User = require('../models/user.models')
const bcrpt = require('bcrypt')
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
        bcrpt
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