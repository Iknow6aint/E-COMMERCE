const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const productSchema = new Schema({
    tittle:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required: true,
    },
    desription:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    publicId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
        ref:'User'
    },
})

module.exports = mongoose.model('Product',productSchema)