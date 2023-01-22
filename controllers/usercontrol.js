const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categoryModel = require("../model/categoryModel");
const { products, category } = require("./admincontrol");
const ProductModel = require("../model/ProductModel");
const bannerModel = require("../model/bannerModel");
const { json } = require("express");
const couponModel = require("../model/couponModel");
const orderModel = require("../model/orderModel");
const { name } = require("ejs");

let transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,

  auth: {
    user: "andruce777@gmail.com",
    pass: "UNtFC0zpY6WGBksy",
  },
});
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

module.exports = {
  home: async (req, res, next) => {
    try {
      console.log(res.locals.userdata);
      let banner = await bannerModel.findOne({ status: true }).limit(1);
      let category = await categoryModel.find().limit(1);
      let row = await categoryModel.find().skip(1).limit(2);
      let col = await categoryModel.find().skip(3).limit(1);
      let products = await ProductModel.find().limit(8).populate("brand");
      res.render("user/userhome", {
        page: "Home",
        category,
        row,
        col,
        products,
        banner,
        user: res.locals.userdata,
      });
    } catch (error) {
      next(error);
    }
  },
  // login:(req,res)=>{
  //     res.render('user/login')
  // },
  signup: (req, res) => {
    res.render("user/signup");
  },
  otpget: (req, res) => {
    res.render("user/Otppage");
  },
  shop: async (req, res, next) => {
    try {
      let category = await categoryModel.find({ status: "Show" });
      let allcount = await ProductModel.find().countDocuments();
      let searResult = [];
      if (req.query.search) {
        let products = await ProductModel.find({
          name: { $regex: req.query.search },
        });
        let count = await ProductModel.find({
          name: { $regex: req.query.search },
        }).countDocuments();
        console.log(count);
        console.log(products);
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
        });
      }
      if (req.query.cate) {
        console.log(req.query.cate + "CATEGORY");
        let products = await ProductModel.find({ brand: req.query.cate });
        let count = await ProductModel.find({
          brand: req.query.cate,
        }).countDocuments();
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
        });
      } else {
        console.log("ELSE");
        let products = await ProductModel.find().limit(12);
        let count = await ProductModel.find().limit(12).count();
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
        });
      }
    } catch (error) {
      next(error);
    }
  },
  productdetials: async (req, res, next) => {
    try {
      const id = req.params.id;
      const val = req.params.val;
      console.log("INSIDE PRODUCT DETILS");
      let prod = await ProductModel.findOne({ _id: id }).populate("brand");
      let products = await ProductModel.find({ brand: val }).limit(4);
      res.render("user/productDetiails", { prod, page: "none", products });
    } catch (error) {
      next(error);
    }
  },
  getModal: async (req, res) => {
    const id = req.body.id;
    let prod = await ProductModel.findOne({ _id: id });
    // res.render('user/productDetiails',{prod,page: 'none'})
    res.json(prod);
  },
  // otp:async(req,res,next)=>{
  //     try{
  //         let userName=req.body.name
  //         let Email=req.body.email
  //         let phone=req.body.phonenumber
  //         let password=req.body.password
  //         req.session.email=Email
  //         console.log(req.body);
  //         // userModel.({email:Email})

  //         password= await bcrypt.hash(password,10)
  //         console.log(password);
  //         let newUser= new userModel({userName, email:Email,phone:phone,password:password})
  //         newUser.save().then((data)=>{
  //             console.log(data);
  //             const mailoptions={
  //                 from:'andruce777@gmail.com',
  //                 to:req.body.email,
  //                 subject:"OTP for registration is :",
  //                 html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
  //             };
  //             transporter.sendMail(mailoptions,(error,info)=>{
  //                 if (error) {
  //                     return console.log(error);
  //                   }
  //                   console.log('Message sent: %s', info.messageId);
  //                   console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  //                   res.render('user/Otppage')
  //             });
  //         }).catch((er)=>{
  //             console.log(er)
  //             console.log("ERROR CATCH");
  //             res.redirect('/signup')
  //         })
  //     }
  //     catch(err){
  //         next(err)
  //     }
  // },
  // ============================OTP============================
  otp: async (req, res, next) => {
    try {
      req.session.Name = req.body.name;
      req.session.Email = req.body.email;
      req.session.Phone = req.body.phonenumber;
      req.session.Password = req.body.password;

      Email = req.body.email;

      const user = await userModel.findOne({ email: Email });

      if (!user) {
        // send mail with defined transport object
        var mailOptions = {
          from: "andruce777@gmail.com",
          to: req.body.email,
          subject: "Otp for registration is: ",
          html:
            "<h3>OTP for account verification is </h3>" +
            "<h1 style='font-weight:bold;'>" +
            otp +
            "</h1>", // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.render("user/Otppage");
        });
      } else {
        res.redirect("/signup");
      }
    } catch (err) {
      next(err);
    }
  },
  verifyotp: async (req, res, next) => {
    try {
      console.log(otp);
      if (req.body.otp == otp) {
        console.log("SECOND");

        req.session.Password = await bcrypt.hash(req.session.Password, 10);
        console.log(req.session.Password);
        let newUser = userModel({
          userName: req.session.Name,
          email: req.session.Email,
          phone: req.session.Phone,
          password: req.session.Password,
        });

        newUser.save().then(() => {
          req.session.useremail = req.body.email;
          req.session.userlogged = true;
          res.redirect("/");
        });
      } else {
        res.render("user/Otppage");
      }
    } catch (err) {
      next(err);
    }
  },
  resendOTP: (req, res, next) => {
    try {
      const mailoptions = {
        from: "andruce777@gmail.com",
        to: req.body.email,
        subject: "OTP for registration is :",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>",
      };
      transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.render("user/Otppage");
      });
    } catch (err) {
      next(err);
    }
  },

  // ++++++++++++++++++++++++++++++SIGNUP USER+++++++++++++++++++++++++++++++++++++++++++

  loginget: (req, res) => {
    // const user=await userModel.find()
    // res.send("HELLO")
    res.render("user/login", { userSts: "unbanned", userName: "correct" });
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email: email });
      if (!user) {
        return res.render("user/login", {
          userSts: "unbanned",
          userName: "incorrect",
        });
      }
      const isPass = await bcrypt.compare(password, user.password);
      if (!isPass) {
        return res.render("user/login", {
          userSts: "unbanned",
          userName: "incorrect",
        });
      }
      if (user.status == "banned") {
        return res.render("user/login", {
          userSts: user.status,
          userName: "correct",
        });
      }
      req.session.useremail = req.body.email;
      req.session.userlogged = true;
      console.log("INSIDE LOGIN");
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
  cart: async (req, res, next) => {
    try {
      console.log("HELLO CART");
      const id = res.locals.userdata;
      let cart = await userModel
        .findOne({ _id: id })
        .populate("cart.product_id");
      res.render("user/cart", { page: "cart", cart });
    } catch (error) {
      next(error);
    }
  },
  addtocart: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const pdid = req.body.id;
      // const price=req.body.price;
      let productprice = await ProductModel.findOne({ _id: pdid });
      console.log(productprice);
      let isExist = await userModel.findOne({ _id: id });
      let cart = isExist.cart.findIndex(
        (pdid) => pdid.product_id == req.body.id
      );
      if (cart == -1) {
        await userModel.updateOne(
          { _id: id },
          {
            $push: {
              cart: {
                product_id: pdid,
                quantity: 1,
                price: productprice.price,
              },
            },
          }
        );
        res.json({ key: "added", price: productprice.price });
      } else {
        res.json("alreadyexit");
      }
    } catch (error) {
      next(error);
    }
  },
  quantity: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
      console.log("REACHED");
      let productcheck = await userModel.findOne({ _id: id, "cart._id": cdid });
      productcheck.cart.forEach(async (val, i) => {
        if (val._id.toString() == cdid.toString()) {
          console.log(val.quantity + "successs");
          productquantity = await ProductModel.findOne({ _id: val.product_id });
          console.log(productquantity.stock + "TEST CHECK");
          if (productquantity.stock <= val.quantity) {
            console.log("INSIDE IF");
            res.json({ key: "over", price: productquantity.stock });
          } else {
            await userModel.updateOne(
              { _id: id, "cart._id": cdid },
              { $inc: { "cart.$.quantity": 1 } }
            );
            res.json("added");
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  quantitydec: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
      // console.log(quantitycheck);
      //  let isExist= await userModel.aggregate([{$match:[{_id:id,cart:cdid}]},{$group:{cart}}]);
      // console.log(isExist+"CHECK IS EXIST");
      // let quantitycheck=isExist.cart.quantity
      // console.log(quantitycheck+"OVER CHEC");
      let quantitycheck = await userModel.findOne({
        _id: id,
        "cart._id": cdid,
      });
      quantitycheck.cart.forEach(async (val, i) => {
        if (val._id.toString() == cdid.toString()) {
          if (val.quantity <= 1) {
            await userModel.updateOne(
              { _id: id._id },
              { $pull: { cart: { _id: cdid } } }
            );
            res.json("deleted");
          } else {
            let userCart = await userModel.updateOne(
              { _id: id, "cart._id": cdid },
              { $inc: { "cart.$.quantity": -1 } }
            );
            res.json("added");
          }
        }
      });
      // let userCart = await userModel.updateOne({_id:id,'cart._id':cdid},{$inc:{'cart.$.quantity':-1}})
      // res.json("added")
    } catch (error) {
      // console.log(error);
      next(error);
    }
  },
  deletecart: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
      console.log(cdid);
      console.log(id);
      await userModel.updateOne(
        { _id: id._id },
        { $pull: { cart: { _id: cdid } } }
      );
      res.json("added");
    } catch (error) {
      next(error);
    }
  },
  wishlist: async (req, res, next) => {
    try {
      //    let wishlist= await userModel.findOne({_id:res.locals.userdata._id}).populate('wishlist._id')
      let wishlist = await userModel.aggregate([
        { $match: { _id: res.locals.userdata._id } },
        {
          $lookup: {
            from: "productdatas",
            localField: "wishlist",
            foreignField: "_id",
            as: "wishlistitems",
          },
        },
      ]);
      console.log(wishlist);
      wishlist = wishlist[0];
      res.render("user/wishlist", { page: "wishlist", wishlist });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  addwishlist: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      // const pdid=req.body.id;
      console.log("WISHLIST");
      // const price=req.body.price;
      // let productprice=await ProductModel.findOne({_id:pdid})
      // console.log(productprice);
      let isExist = await userModel.findOne({ _id: id });
      console.log(req.body.id);
      let wishlist = isExist.wishlist.findIndex((pdid) => pdid == req.body.id);
      console.log(wishlist);
      if (wishlist == -1) {
        console.log("Inside");
        await userModel.updateOne(
          { _id: id },
          { $push: { wishlist: req.body.id } }
        );
        res.json({ key: "added" });
      } else {
        res.json("alreadyexit");
      }
    } catch (error) {
      next(error);
    }
  },
  deleteitem: async (req, res, next) => {
    try {
      console.log("WISHLIST remove");
      await userModel.updateOne(
        { _id: res.locals.userdata.id },
        { $pull: { wishlist: req.body.id } }
      );
      res.json("added");
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  account: async (req, res, next) => {
    try {
      console.log("HELLO");
      const id = res.locals.userdata;
      let userdetials = await userModel.findOne({ _id: id });

      res.render("user/account", { page: "Account", userdetials });
    } catch (error) {
      next(error);
    }
  },
  addaddress: async (req, res, next) => {
    try {
      const id = res.locals.userdata._id;
      console.log(id);
      let isExist = await userModel.findOne({ _id: id });
      console.log(isExist + "INSIDE");

      let newaddresss = {
        name: req.body.Name,
        house: req.body.House,
        post: req.body.post,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pin: req.body.pin,
      };

      // console.log(newaddresss+"CHECK");
      await userModel.updateOne(
        { _id: id },
        { $push: { address: newaddresss } }
      );
      res.redirect("/account");
    } catch (error) {
      next(error);
    }
  },
  editaddress: async (req, res, next) => {
    try {
      console.log("REACHED");
      const id = res.locals.userdata._id;
      const addid = req.body.id;
      console.log(addid);
      let useraddress = await userModel.findOne({ _id: id });
      // console.log(useraddress +"LOG");
      useraddress.address.forEach((val) => {
        if (val.id.toString() == addid.toString()) {
          res.json(val);
        }
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  updateaddress: async (req, res, next) => {
    try {
      // console.log(id);
      // let isExist=await userModel.findOne({_id:id})
      // console.log(isExist+"INSIDE");
      // console.log(req.body);
      console.log(req.params.id + "ADDRESS ID");
      console.log(req.body);
      let newaddressupdate = {
        "address.$.name": req.body.Name,
        "address.$.house": req.body.House,
        "address.$.post": req.body.post,
        "address.$.city": req.body.city,
        "address.$.district": req.body.district,
        "address.$.state": req.body.state,
        "address.$.pin": req.body.pin,
      };
      console.log(newaddressupdate);
      await userModel
        .updateOne(
          { _id: res.locals.userdata._id, "address._id": req.params.id },
          { $set: newaddressupdate }
        )
        .then(() => {
          res.redirect("/account");
        });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  deleteaddress: async (req, res, next) => {
    try {
      await userModel.updateOne(
        { _id: res.locals.userdata._id },
        { $pull: { address: { _id: req.body.id } } }
      );
      res.json("deleted");
    } catch (error) {
      next(error);
    }
  },
  orderid: async (req, res, next) => {
    try {
      const id = res.locals.userdata._id;
      console.log(id);
      let total = 0;
      let cartproducts = [];

      let cartbill = await userModel
        .findOne({ _id: id })
        .populate("cart.product_id");
      if (cartbill) {
        cartbill.cart.forEach((_id) => {
          total = total + _id.quantity * _id.product_id.price;
          let product = {
            product_id: _id.product_id._id,
            name: _id.product_id.name,
            qnty: _id.quantity,
            price: _id.product_id.price,
          };
          cartproducts.push(product);
        });
        let product = {
          userid: res.locals.userdata._id,
          bill_amount: total,
          products: cartproducts,
          coupon: { discount: 0 },
        };
        let neworder = new orderModel(product);
        neworder.save().then((data) => {
          console.log(data._id + "ID");
          res.json(data);
        });
      }
    } catch (error) {
      next(error);
    }
  },

  checkout: async (req, res, next) => {
    try {
      console.log(req.params.id);
      let orderData = await orderModel.findOne({ _id: req.params.id });
      let cartbill = await userModel.findOne({ _id: res.locals.userdata._id });

      res.render("user/checkout", { page: "none", cartbill, orderData });
    } catch (error) {
      next(error);
    }
  },
  couponcheck: (req, res, next) => {
    try {
      let apiRes = {};
      console.log(req.body.key);
      console.log(req.body.id);
      if (req.body.key) {
        couponModel
          .findOne({
            couponCode: req.body.key,
            couponUser: { $nin: [res.locals.userdata._id] },
          })
          .then((data) => {
            if (data) {
              if (data.expiryDate >= new Date()) {
                console.log("INSIDE");
                orderModel
                  .findOne({
                    _id: req.body.id,
                    userid: res.locals.userdata._id,
                    order_status: "pending",
                  })
                  .then((orderdetials) => {
                    if (orderdetials.bill_amount > data.minimumAmount) {
                      orderModel
                        .updateOne(
                          {
                            _id: req.body.id,
                            userid: res.locals.userdata._id,
                            order_status: "pending",
                          },
                          {
                            $set: {
                              coupon: {
                                name: data.couponName,
                                code: data.couponCode,
                                discount: data.percentage,
                              },
                            },
                          }
                        )
                        .then(async () => {
                          await couponModel.updateOne(
                            { _id: data._id },
                            {
                              $addToSet: {
                                couponUser: res.locals.userdata._id,
                              },
                            }
                          );
                          console.log(data + "ORDER DETAILS");
                          apiRes.coupon = data;
                          apiRes.message = "Applied coupon";
                          apiRes.success = true;
                          res.json(apiRes);
                        });
                    } else {
                      apiRes.message =
                        "This coupon in not used for this bill amount";
                      res.json(apiRes);
                    }
                  });
              } else {
                console.log("coupon expired");
                apiRes.message = "coupon expired";
                res.json(apiRes);
              }
            } else {
              console.log("Invalid coupon ");
              apiRes.message = "Invalid coupon || This coupon already used";
              res.json(apiRes);
            }
          });
      } else {
        apiRes.message = "enter coupon code";
        res.json(apiRes);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  // editbill:(req,res,next)=>{
  //      try {
  //       if(req.body.bill){
  //          orderModel.updateOne({_id:req.body.id},{$set:{bill_amount:req.body.bill}}).then(()=>{
  //              res.json()
  //          })
  //       }
  //      }catch (error) {
  //       next(next)
  //      }
  // },
  selectaddress: async (req, res, next) => {
    try {
      console.log("REACHED");
      const id = res.locals.userdata._id;
      const addid = req.body.id;
      let useraddress = await userModel.findOne({ _id: id });
      useraddress.address.forEach((val) => {
        if (val._id.toString() == addid.toString()) {
          res.json(val);
        }
      });
    } catch (error) {
      next(error);
    }
  },
  searchFun: async (req, res, next) => {
    try {
      console.log("success searchfun");
      let apiRes = {};
      const searResult = [];
      if (req.body.value) {
        let usersearch = new RegExp("^" + req.body.value + ".*", "i");
        let categorysearch = await categoryModel.aggregate([
          { $match: { $or: [{ categoryName: usersearch }] } },
        ]);
        categorysearch.forEach((field) => {
          searResult.push({
            titile: field.categoryName,
            type: "category",
            id: field._id,
          });
        });
        let productsearch = await ProductModel.aggregate([
          {
            $match: {
              $or: [
                { name: usersearch },
                { description: usersearch },
                { price: usersearch },
              ],
            },
          },
        ]);
        productsearch.forEach((field) => {
          searResult.push({
            titile: field.name,
            type: "product",
            id: field._id,
            cate: field.brand,
          });
        });

        console.log(searResult);
        apiRes.search = searResult;
        res.json(apiRes);
      } else {
        res.json("noresult");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  //   addaddresscheck: (req, res, next) => {
  //     try {
  //       console.log(req.body, name);
  //       res.json();
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
  checkoutform: async (req, res, next) => {
    try {
      if (req.body.flexRadioDefault == "COD") {
        if (req.params.id) {
          console.log(req.params.id);
          const order = await orderModel.findOne({
            _id: req.params.id,
            userid: res.locals.userdata._id,
            order_status: "pending",
          });
          console.log(req.body);
          console.log(order);
          if (order) {
            orderModel
              .updateOne(
                { _id: req.params.id },
                {
                  $set: {
                    address: {
                      name: req.body.firstName,
                      house: req.body.House,
                      post: req.body.Post,
                      pin: req.body.pin,
                      city: req.body.city,
                      district: req.body.district,
                      state: req.body.state,
                    },
                    order_status:"completed",
                    "payment.payment_id": "COD_" + req.params.id,
                    "payment.payment_order_id": "COD_noOID",
                    "payment.payment_method": "cash_on_delivery",
                    "delivery_status.ordered.state": true,
                    "delivery_status.ordered.date": Date.now(),
                  },
                }
              )
              .then(async () => {
                await userModel.updateOne(
                  { _id: res.locals.userdata._id },
                  { $set: { cart: [] } }
                );

                res.send("COD SUCCESSFULL");
              })
              .catch((err) => {
                next(err);
              });
            // res.send('sucesss')
          }
        }
      } else {
        res.send("RAZOPAY PENDING");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  orderDetails:(req,res,next)=>{
    try {
      orderModel.find({userid:res.locals.userdata._id,order_status:{$ne:'pending'}}).then((orderDetails)=>{
      res.render('user/orderDetails',{page: "Account",orderDetails})
      })
    } catch (error) {
      next(error)
    }
  },
  // ViewOrder:(req,res,next)=>{
  //   try {
  //     orderModel.findOne({userid:res.locals.userdata._id}).populate('products.product_id').then((orderDetails)=>{
  //       res.render('user/ViewOrder',{ page: "Account",orderDetails})
  //     })
  //   } catch (error) {
  //     next(error)
  //   }
  // },
  logout: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/login");
    } catch (error) {
      next(error);
    }
  },
};
