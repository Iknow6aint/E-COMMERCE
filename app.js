const express = require('express');
const debug = require('debug')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://iknowsaint:Jajabone@e-commerce.jyo2lc6.mongodb.net/e-commerce?retryWrites=true&w=majority")
 .then(()=> console.log("DB connection successful"))
 .catch((err)=>{
    console.log(err);
 })

const authRouter = require('./routes/auth.routes')
const adminRouter =require('./routes/admin.routes')

const app = express()
debug(express)

app.use(authRouter);
app.use(adminRouter);

module.exports = app