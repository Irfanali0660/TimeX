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
})

module.exports = userModel = mongoose.model('userData',userSchema);