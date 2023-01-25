const mongoose = require('mongoose');

const categorySchema =new mongoose.Schema({
  
    categoryName:{
        type:String,
        required:true,
        unique:true
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