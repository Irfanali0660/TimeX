const mongoose = require('mongoose');

const userSchema =new mongoose.Schema({
  
    userName: {
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'unbanned'
    },
    wallet:{
        type: Number,
        default:0,
    },
    address:[
        {
            name:{type:String},
            house:{type:String},
            post:{type:String},
            city:{type:String},
            district:{type:String},
            state:{type:String},
            pin:{type:Number}
        }
    ],
    cart:[
        {
            product_id:{type:mongoose.Schema.Types.ObjectId,ref:"productdata",required:true},
            quantity:{type:Number,required:true}     
        }
        
    ],
    wishlist:[
        mongoose.Schema.Types.ObjectId
    ]
})

module.exports = userModel = mongoose.model('userData',userSchema);