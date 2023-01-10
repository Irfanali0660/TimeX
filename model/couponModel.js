const mongoose = require('mongoose');

const coupnSchema =new mongoose.Schema({
  
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    }, 
})

module.exports = couponModel = mongoose.model('couponData',coupnSchema);