const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        min:3,
        max:50
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        min:4,
        max:12
    },
    resetToken:String,
    resetTokenExpiration:Date,
    cart:{
        items:[
            {
                productId:{
                    type:Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                },
            },
        ],
    },

});

module.exports = mongoose.model('User',userSchema)