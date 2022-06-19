const express = require('express');
const debug = require('debug')
const dotenv = require('dotenv')

const authRouter = require('./routes/auth.routes')

const app = express()
debug(express)

app.use(authRouter);

module.exports = app