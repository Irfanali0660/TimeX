const adminModel = require("../model/adminModel")
const userModel = require("../model/userModel")
const bcrypt = require('bcrypt');
const multer = require('multer');
const ProductModel = require("../model/ProductModel");
const fs = require('fs');
const path = require('path');
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel");
const couponModel = require("../model/couponModel");
const orderModel = require("../model/orderModel");
// const bcrypt = require('bcrypt');
// const collection = require('../module/collection');


module.exports = {

    dashbord: (req, res) => {
        orderModel.find({order_status:{$ne:'pending'}}).populate('userid').sort({ordered_date:-1}).limit(10).then((orders)=>{
            res.render('admin/admin_dashbord', { page: 'dashbord', admin: res.locals.admindata.name ,orders})
        })
        
    },
    login: async (req, res) => {
        if (req.session.adminLogin) {
            res.redirect('/dashbord')
        }
        const { email, password } = req.body;
        const ademail = await adminModel.findOne({ email })
        if (!ademail) {
            return res.render('admin/adminlogin', { notAdmin: "true" })
        }
        const adpass = await adminModel.findOne({ password })
        if (!adpass) {
            return res.render('admin/adminlogin', { notAdmin: "true" })
        }
        req.session.adminLogin = true;
        req.session.adminemail = req.body.email;
        res.redirect('/dashbord')
    },
    products: async (req, res, next) => {
        try {

            const products = await ProductModel.find().populate('brand')
            res.render('admin/admin_products', { page: 'Products', products, admin: res.locals.admindata.name })
        } catch (error) {
            next(error)
        }
    },
    addProducts:async (req, res, next) => {
        try {
            let category=await categoryModel.find()
            res.render('admin/admin_addProduct', { page: 'Products', admin: res.locals.admindata.name, field: "field", userstatus: "false" ,category})
        } catch (error) {
            next(error)
        }
    },
    addprodcut: async(req, res, next) => {
        try {
            let category=await categoryModel.find()
            const filenames = req.files.map(file => (file.filename))
            if (req.body.name && req.body.description && req.body.shortdescription && req.body.price  && req.body.brand && req.body.stock && req.body.status && filenames) {
                let product = ProductModel({
                    name: req.body.name,
                    description: req.body.description,
                    shortDescription: req.body.shortdescription,
                    price: req.body.price,
                    // category: req.body.category,
                    brand: req.body.brand,
                    stock: req.body.stock,
                    status: req.body.status,
                    image: filenames
                })
                product.save().then(() => {
                    res.render('admin/admin_addProduct', { page: 'Products', admin: res.locals.admindata.name, field: "field", userstatus: "true" ,category})
                })
            } else {
                console.log("INSIDE ELSE");
                res.render('admin/admin_addProduct', { page: 'Products', admin: res.locals.admindata.name, field: "no field", userstatus: "false" ,category})
            }
        } catch (error) {
            next(error)
        }
    },
    deleteproduct: async (req, res, next) => {
        try {
            const id = req.params.id;
            const product = await ProductModel.findOne({ _id: id })

            product.image.forEach(value => {
                fs.unlink(path.join(__dirname, '../public/productimages/', value), () => {
                    console.log("NOT FINISH");
                });
            })
            ProductModel.deleteOne({ _id: id })
                .then(() => {
                    res.redirect('/products');
                })
        } catch (error) {
            next(error)
        }
    },
    editproduct: (req, res) => {
        res.render('admin/admin_productEdit', { page: 'Products', admin: res.locals.admindata.name, field: "field" })
    },
    editproducts: async (req, res) => {
        const id = req.params.id;
        let products = await ProductModel.findOne({ _id: id }).populate('brand')
        let category= await categoryModel.find()
        res.render('admin/admin_productEdit', { page: 'Products', admin: res.locals.admindata.name, field: "field", products,category,userstatus: "false" })
    },
    deleteimage: async (req, res) => {
        const val = req.params.val;
        const id = req.params.id;
        fs.unlink(path.join(__dirname, '../public/productimages/', val), () => { })
        await productModel.updateOne({ _id: id }, { $pull: { image: val } })
        res.redirect('/editproduct/' + id)
    },
    updateProduct: async (req, res, next) => {
        try {
            const id = req.params.id;
            console.log(req.body);
            const filenames = req.files.map(file => (file.filename))
            let dataToUpdate = {
                name: req.body.name,
                description: req.body.description,
                shortDescription: req.body.shortdescription,
                price: req.body.price,
                brand: req.body.brand,
                stock: req.body.stock,
                status: req.body.status,
            }
            if (req.files.length > 0) {
                // ProductModel.findOneAndUpdate({_id:id}, { $push: { image:filenames } })
                ProductModel.updateOne({ _id: id }, { $push: { image: { $each: filenames } } }).then((data) => console.log(data))
            }
            let category= await categoryModel.find()
            products = await ProductModel.findOneAndUpdate({ _id: id }, { $set: dataToUpdate })
            res.render('admin/admin_productEdit', { page: 'Products', admin: res.locals.admindata.name, field: "field",category, products, userstatus: "true" })
        } catch (error) {
            next(error)
        }

    },
    customers: async (req, res, next) => {
        try {
            const users = await userModel.find()
            res.render('admin/admin_customers', { page: 'customers', users, admin: res.locals.admindata.name })
        } catch (error) {
            next(error)
        }
    },
    adminlogin: (req, res) => {
        if (req.session.adminLogin) {
            res.redirect('/dashbord')
        }
        res.render('admin/adminlogin', { notAdmin: "false" })
    },

    block: async (req, res, next) => {
        try {
            const id = req.params.id;
            await userModel.updateOne({ _id: id }, { $set: { status: "banned" } })
                .then(() => {

                    res.redirect('/customers');
                })
        } catch (error) {
            next(error)
        }
    },
    unblock: async (req, res, next) => {
        try {
            const id = req.params.id;
            await userModel.updateOne({ _id: id }, { $set: { status: "unbanned" } })
                .then(() => {
                    res.redirect('/customers');
                })
        } catch (error) {
            next(error)
        }
    },
    deleteuser: async (req, res, next) => {
        try {
            const id = req.params.id;
            await userModel.deleteOne({ _id: id })
                .then(() => {
                    res.redirect('/customers');
                })
        } catch (error) {
            next(error)
        }
    },
    category: async (req, res) => {
        let Categories = await categoryModel.find()
        res.render('admin/admin_category', { page: 'category', admin: res.locals.admindata.name, Categories })
    },
    addcategory: (req, res) => {
        res.render('admin/admin_addCategory', { page: 'category', admin: res.locals.admindata.name, ustatus: "no" })
    },
    addcategorydetials:async (req, res, next) => {
        try {
            console.log(req.body);
            let Cname=req.body.category.toLowerCase()
           let catecheck= await categoryModel.findOne({categoryName:Cname})
            console.log(catecheck+"CHECK");
            if (!catecheck) {
                console.log("INSIDE IF");
                let categorys = categoryModel({
                    categoryName: Cname,
                    date: req.body.Date,
                    status: req.body.status,
                    image: req.file.filename
                })
                categorys.save().then(() => {

                    res.render('admin/admin_addCategory', { page: 'category', admin: res.locals.admindata.name, ustatus: "true" })
                })
            } else {
                console.log("INSIDE ELSE");
                res.render('admin/admin_addCategory', { page: 'category', admin: res.locals.admindata.name, ustatus: "false" })
            }
        } catch (error) {
            next(error)
        }
    },
    updatecategory:async(req,res)=>{
        id=req.params.id;
        let Categories = await categoryModel.findOne({ _id: id })
        
        res.render('admin/admin_updateCategory', { page: 'category', admin: res.locals.admindata.name, ustatus: "false" ,Categories})
    },
    Updatecategories:async(req,res,next)=>{
        try {
            const id = req.params.id;
            const val= req.params.val;
            const cname=req.body.category.toLowerCase()
            let cateToUpdate = {
             categoryName:cname,
             date:req.body.Date,
             status:req.body.status
            }
            if (req.file) {
                fs.unlink(path.join(__dirname, '../public/productimages/', val), () => {
                })
                cateToUpdate.image=req.file.filename; 
                
            }
            let Categories = await categoryModel.findOneAndUpdate({ _id: id }, { $set: cateToUpdate })
            res.redirect('/category')
        } catch (error) {
            next(error)
        }
    },
    deletecategories:async(req,res)=>{
        try {
            const id = req.params.id;
            const img=req.params.val;
            await categoryModel.findOne({ _id: id })
                fs.unlink(path.join(__dirname, '../public/productimages/',img), () => {
                    console.log("NOT FINISH");
                });
            
            categoryModel.deleteOne({ _id: id })
                .then(() => {
                    res.redirect('/category');
                })
        } catch (error) {
            next(error)
        }
    },
    banner:async(req,res)=>{
        try {
           
            const banner=await bannerModel.find()
            res.render('admin/banner',{ page: 'banner', admin: res.locals.admindata.name ,banner,});

        } catch (error) {
            next(error)
        }
       
    },
    addbanner:(req,res)=>{
        res.render('admin/addBanner',{ page: 'banner', admin: res.locals.admindata.name ,ustatus:"no"})
    },
    AddBanner:(req,res)=>{
        try {
            if (req.body.banner && req.file.filename) {
                console.log("INSIDE IF");
                let banner = bannerModel({
                    bannerName: req.body.banner,
                    description: req.body.description,
                    image: req.file.filename
                })
                banner.save().then(() => {
                    res.render('admin/addBanner', { page: 'banner', admin: res.locals.admindata.name, ustatus: "true" })
                })
            } else {
                res.render('admin/addBanner', { page: 'banner', admin: res.locals.admindata.name, ustatus: "false" })
            }
        } catch (error) {
            next(error)
        }
    },
    disable: async (req, res, next) => {
        try {
            const id = req.params.id;
            await bannerModel.updateOne({ _id: id }, { $set: { status: "false" } })
                .then(() => {

                    res.redirect('/Banners');
                })
        } catch (error) {
            next(error)
        }
    },
    enable: async (req, res, next) => {
        try {
            const id = req.params.id;
            await bannerModel.updateOne({ _id: id }, { $set: { status: "true" } })
                .then(() => {
                    res.redirect('/Banners');
                })
        } catch (error) {
            next(error)
        }
    },
    deletebanner:async(req,res)=>{
        try {
            const id = req.params.id;
            const img=req.params.val;
            await bannerModel.findOne({ _id: id })
                fs.unlink(path.join(__dirname, '../public/productimages/',img), () => {
                    console.log("NOT FINISH");
                });
            
            bannerModel.deleteOne({ _id: id })
                .then(() => {
                    res.redirect('/banners');
                })
        } catch (error) {
            next(error)
        }
    },
    coupon:async(req,res,next)=>{
        try {
            console.log("INSIDE COUPON");
            const id=req.body.id;
            const coupon= await couponModel.find()
            const singlecoupon=await couponModel.find({_id:id})
            console.log(coupon);
            res.render('admin/coupon',{page:'coupon', admin: res.locals.admindata.name,coupon,singlecoupon})
        } catch (error) {
            next(error)
        }
    },
    addcoupon:async(req,res,next)=>{
        try {
            const cpname=req.body.couponName.toLowerCase();
            const cpcheck=await couponModel.findOne({couponName:cpname})
            if (!cpcheck) {
                console.log("INSIDE IF");
                let coupon = couponModel({
                    couponName: cpname,
                    couponCode: req.body.couponCode,
                    percentage: req.body.percentage,
                    expiryDate: req.body.expDate,
                    minimumAmount:req.body.minimumAmount
                })
                coupon.save().then(() => {
                   res.redirect('/coupon')
                })
            } else {
               res.redirect('/coupon')
            }
        } catch (error) {
            next(error)
        }
    },
    deleteCoupon:async(req,res)=>{
        try {
            const id = req.params.id;            
            couponModel.deleteOne({ _id: id })
                .then(() => {
                    console.log("Inside product");
                    res.redirect('/coupon');
                })
        } catch (error) {
            next(error)
        }
    },
    updatecoupon:async(req,res)=>{
        try {
            const id = req.params.id;
            const cname=req.body.couponName.toLowerCase()
            let coupToUpdate = {
                couponName: cname,
                couponCode: req.body.couponCode,
                percentage: req.body.percentage,
                expiryDate: req.body.expDate,
                minimumAmount:req.body.minimumAmount
            }
             await couponModel.updateOne({ _id: id }, { $set: coupToUpdate })
            res.redirect('/coupon')
        } catch (error) {
            next(error)
        }
    },
    ajaxcoupon:async(req,res,next)=>{      
        try {
            console.log("REACHED");
            console.log(req.body.id+"ID");
            let coupondet=  await couponModel.findOne({_id:req.body.id})
            // console(coupondet+"COUPON")
            res.json(coupondet)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    ordermanagement:async(req,res,next)=>{
          try {
            orderModel.find({order_status:{$ne:'pending'}}).populate('userid').sort({ordered_date:-1}).then((orders)=>{
                res.render('admin/orderManagement', { page: 'order', admin: res.locals.admindata.name, ustatus: "false" ,orders})
            })
        } catch (error) {
            console.log(error);
            next(error)
          }
    },
    orderlist:(req,res,next)=>{
        try {
           
        orderModel.findOne({_id:req.params.id}).populate(['products.product_id','userid']).then((singleorder)=>{
            // console.log(singleorder);
            res.render('admin/orderdetials',{ page: 'order', admin: res.locals.admindata    .name, ustatus: "false",singleorder})
        })
        } catch (error) {
            next(error)
        }
    },
    delivarystatus:(req,res,next)=>{
        try {
            console.log(req.body.Status);
            console.log(req.body.id);
            if(req.body.Status=='shipped'){
            orderModel.updateOne({_id:req.body.id},{$set:{'delivery_status.shipped.state':true,'delivery_status.shipped.date':Date.now()}}).then((data)=>{
                res.redirect('/orderlist/'+req.body.id)
            })
            }
            else if(req.body.Status=='out_for_delivery'){
                orderModel.updateOne({_id:req.body.id},{$set:{'delivery_status.out_for_delivery.state':true,'delivery_status.out_for_delivery.date':Date.now()}}).then((data)=>{
                    res.redirect('/orderlist/'+req.body.id)
                })
            }
            else if(req.body.Status=='delivered'){
                orderModel.updateOne({_id:req.body.id},{$set:{'delivery_status.delivered.state':true,'delivery_status.delivered.date':Date.now()}}).then((data)=>{
                    res.redirect('/orderlist/'+req.body.id)
                })
            }
            else{
                res.redirect('/orderlist/'+req.body.id)
            }
            
        } catch (error) {
            next(error)
        }
    },
    paymentpending:(req,res,next)=>{
        try {
            console.log("reached");
            console.log(req.body.id);
            orderModel.updateOne({_id:req.body.id},{$set:{'payment.payment_status':"completed"}}).then(()=>{
                res.json('completed')
            })
        } catch (error) {
            next(error)
        }
    },
    invoice:(req,res,next)=>{
        try {
            orderModel.findOne({_id:req.params.id}).populate(['products.product_id','userid']).then((invoice)=>{           
                res.render('admin/orderinvoice',{ page: 'order', admin: res.locals.admindata.name, ustatus:"false",invoice})
            })
        } catch (error) {
            next(error)
        }
    },
    salesReport:(req,res,next)=>{
        try {
            res.render('admin/salesReport',{page: 'salesReport', admin: res.locals.admindata.name, ustatus:"false"})
        } catch (error) {
            next(error)
        }
    },
    salesDetails:async(req,res,next)=>{
        try {
            let salesDetails = await orderModel.aggregate([
                {
                  $match: {
                    order_status: "completed",
                    'delivery_status.delivered.state':true,
                    $and: [
                      { ordered_date: { $gt: new Date(req.body.from) } },
                      { ordered_date: { $lt: new Date(req.body.to) } },
                    ],
                  },
                },
                {
                  $lookup: {
                    foreignField: "_id",
                    localField: "userid",
                    from: "userdatas",
                    as: "userid",
                  },
                },
                { $sort: { ordered_date: -1 } },
              ])
              console.log(salesDetails);
              res.render('admin/salesDetails',{page: 'salesReport', admin: res.locals.admindata.name, ustatus:"false",salesDetails})
        } catch (error) {
            next(error)
        }
    },
    logout: (req,res,next) => {
      try {
        req.session.adminlogin = false;
        req.session.destroy();
        res.redirect('/adminlogin');
      } catch (error) {
        next(error)
      }
    }
}