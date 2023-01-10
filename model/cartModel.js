const mongoose = require('mongoose');

const cartSchema =new mongoose.Schema({
  
    cartName:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
   
})

module.exports = categoryModel = mongoose.model('categoryData',categorySchema);