const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categoryModel = require("../model/categoryModel");
const ProductModel = require("../model/ProductModel");
const bannerModel = require("../model/bannerModel");
const couponModel = require("../model/couponModel");
const orderModel = require("../model/orderModel");


const Razorpay = require("razorpay");
const crypto = require("crypto");
const reviewModel = require("../model/reviewModel");

const ITEMS_PAGE = 12;

let instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_SECRET_KEY,
});

let transporter = nodemailer.createTransport({
  host: process.env.host,
  port: 587,

  auth: {
    user: process.env.Email,
    pass: process.env.pass,
  },
});
let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

module.exports = {
 
  //================================ User Home ==================================//

  home: async (req, res, next) => {
    try {
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
        user: req.session.user,
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ signup ==================================//

  signup: (req, res) => {
    res.render("user/signup",{status:"false"});
  },

  //================================ OtpPage ==================================//

  otpget: (req, res) => {
    res.render("user/Otppage");
  },

  //================================ Shop ==================================//

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
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
          user: req.session.user,
        });
      }
      if (req.query.cate) {
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
          user: req.session.user,
        });
      } else if (req.query.page) {
        const page = req.query.page;
        let products = await ProductModel.find()
          .skip((page - 1) * ITEMS_PAGE)
          .limit(ITEMS_PAGE);
        let count = await ProductModel.find({
          brand: req.query.cate,
        }).countDocuments();
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
          user: req.session.user,
        });
      } else {
        let products = await ProductModel.find().limit(12);
        let count = await ProductModel.find().limit(12).count();
        res.render("user/products", {
          page: "Shop",
          products,
          category,
          count,
          allcount,
          user: req.session.user,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Single Productpage ==================================//

  productdetials: async (req, res, next) => {
    try {
      const id = req.params.id;
      const val = req.params.val;
      let prod = await ProductModel.findOne({ _id: id }).populate("brand");
      let products = await ProductModel.find({ brand: val }).limit(4);
      let review = await reviewModel
        .find({ product_id: id })
        .populate("userid");
      res.render("user/productDetiails", {
        prod,
        page: "none",
        products,
        user: req.session.user,
        review,
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Product Modal ==================================//

  getModal: async (req, res) => {
    const id = req.body.id;
    let prod = await ProductModel.findOne({ _id: id });
    res.json(prod);
  },

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
          from: process.env.Email,
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
            res.render("error/error");
          }
          res.render("user/Otppage",{status:"false"});
        });
      } else {
        res.render("user/signup",{status:"true"});
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Verify Otp ==================================//

  verifyotp: async (req, res, next) => {
    try {
      if (req.body.otp == otp) {
        req.session.Password = await bcrypt.hash(req.session.Password, 10);
        let newUser = userModel({
          userName: req.session.Name,
          email: req.session.Email,
          phone: req.session.Phone,
          password: req.session.Password,
        });

        newUser.save().then(() => {
          req.session.useremail = req.session.Email;
          req.session.userlogged = true;
          req.session.user = newUser;
          res.redirect("/");
        });
      } else {
        res.render("user/Otppage",{status:"true"});
      }
    } catch (err) {
      next(err);
    }
  },

  //================================ Resend Otp ==================================//

  resendOTP: (req, res, next) => {
    try {
      const mailoptions = {
        from: process.env.Email,
        to: Email,
        subject: "OTP for registration is :",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>",
      };
      transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          res.render("error/error");
        }
        res.render("user/Otppage");
      });
    } catch (err) {
      next(err);
    }
  },

  //================================ Login Page ==================================//

  loginget: (req, res) => {
    res.render("user/login", { userSts: "unbanned", userName: "correct" });
  },

  //================================ Login Post ==================================//

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
      req.session.user = user;
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },

  //================================ Cart ==================================//

  cart: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      let cart = await userModel
        .findOne({ _id: id })
        .populate("cart.product_id");
      res.render("user/cart", { page: "cart", cart, user: req.session.user });
    } catch (error) {
      next(error);
    }
  },

  //================================ Cart ==================================//

  addtocart: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const pdid = req.body.id;
      let productprice = await ProductModel.findOne({ _id: pdid });
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
                // price: productprice.price,
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

  //================================ Cart Quantity Increase ==================================//

  quantity: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
      let productcheck = await userModel.findOne({ _id: id, "cart._id": cdid });
      productcheck.cart.forEach(async (val, i) => {
        if (val._id.toString() == cdid.toString()) {
          productquantity = await ProductModel.findOne({ _id: val.product_id });
          if (productquantity.stock <= val.quantity) {
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

  //================================ Cart Ouantity decrease ==================================//

  quantitydec: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
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
            await userModel.updateOne(
              { _id: id, "cart._id": cdid },
              { $inc: { "cart.$.quantity": -1 } }
            );
            res.json("added");
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Delete Cart ==================================//

  deletecart: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      const cdid = req.body.id;
      await userModel.updateOne(
        { _id: id._id },
        { $pull: { cart: { _id: cdid } } }
      );
      res.json("added");
    } catch (error) {
      next(error);
    }
  },

  //================================ wishlist ==================================//

  wishlist: async (req, res, next) => {
    try {
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
      wishlist = wishlist[0];
      res.render("user/wishlist", {
        page: "wishlist",
        wishlist,
        user: req.session.user,
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Add Wishlist ==================================//

  addwishlist: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      let isExist = await userModel.findOne({ _id: id });
      let wishlist = isExist.wishlist.findIndex((pdid) => pdid == req.body.id);
      if (wishlist == -1) {
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

  //================================ Delete Item ==================================//

  deleteitem: async (req, res, next) => {
    try {
      await userModel.updateOne(
        { _id: res.locals.userdata.id },
        { $pull: { wishlist: req.body.id } }
      );
      res.json("added");
    } catch (error) {
      next(error);
    }
  },

  //================================ User Account ==================================//

  account: async (req, res, next) => {
    try {
      const id = res.locals.userdata;
      let userdetials = await userModel.findOne({ _id: id });

      res.render("user/account", {
        page: "Account",
        userdetials,
        user: req.session.user,
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Add Address ==================================//

  addaddress: async (req, res, next) => {
    try {
      const id = res.locals.userdata._id;
      let isExist = await userModel.findOne({ _id: id });
      let newaddresss = {
        name: req.body.Name,
        house: req.body.House,
        post: req.body.post,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pin: req.body.pin,
      };
      await userModel.updateOne(
        { _id: id },
        { $push: { address: newaddresss } }
      );
      res.redirect("/account");
    } catch (error) {
      next(error);
    }
  },

  //================================ Edit Address ==================================//

  editaddress: async (req, res, next) => {
    try {
      const id = res.locals.userdata._id;
      const addid = req.body.id;
      let useraddress = await userModel.findOne({ _id: id });
      useraddress.address.forEach((val) => {
        if (val.id.toString() == addid.toString()) {
          res.json(val);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Update Address ==================================//

  updateaddress: async (req, res, next) => {
    try {
      let newaddressupdate = {
        "address.$.name": req.body.Name,
        "address.$.house": req.body.House,
        "address.$.post": req.body.post,
        "address.$.city": req.body.city,
        "address.$.district": req.body.district,
        "address.$.state": req.body.state,
        "address.$.pin": req.body.pin,
      };
      await userModel
        .updateOne(
          { _id: res.locals.userdata._id, "address._id": req.params.id },
          { $set: newaddressupdate }
        )
        .then(() => {
          res.redirect("/account");
        });
    } catch (error) {
      next(error);
    }
  },

  //================================ Delete Address ==================================//

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

  //================================ Order Id creation ==================================//

  orderid: async (req, res, next) => {
    try {
      const id = res.locals.userdata._id;
      let total = 0;
      let cartproducts = [];

      let cartbill = await userModel
        .findOne({ _id: id })
        .populate("cart.product_id");
      if (cartbill.cart.length > 0) {
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
          res.json(data);
        });
      } else {
        res.json("empty");
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Checkout Page ==================================//

  checkout: async (req, res, next) => {
    try {
      let orderData = await orderModel.findOne({ _id: req.params.id });
      let cartbill = await userModel.findOne({ _id: res.locals.userdata._id });
      res.render("user/checkout", {
        page: "none",
        cartbill,
        orderData,
        user: req.session.user,
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Apply Coupon ==================================//

  couponcheck: (req, res, next) => {
    try {
      let apiRes = {};
      if (req.body.key) {
        couponModel
          .findOne({
            couponCode: req.body.key,
            couponUser: { $nin: [res.locals.userdata._id] },
          })
          .then((data) => {
            if (data) {
              if (data.expiryDate >= new Date()) {
                orderModel
                  .findOne({
                    _id: req.body.id,
                    userid: res.locals.userdata._id,
                    order_status: "pending",
                  })
                  .then((orderdetials) => {
                    if (orderdetials.coupon.name) {
                      apiRes.message = "This Coupon appiled your order";
                      res.json(apiRes);
                    } else {
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
                    }
                  });
              } else {
                apiRes.message = "coupon expired";
                res.json(apiRes);
              }
            } else {
              apiRes.message = "Invalid coupon || This coupon already used";
              res.json(apiRes);
            }
          });
      } else {
        apiRes.message = "enter coupon code";
        res.json(apiRes);
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Select Address ==================================//

  selectaddress: async (req, res, next) => {
    try {
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

  //================================ Search Fun ==================================//

  searchFun: async (req, res, next) => {
    try {
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

        apiRes.search = searResult;
        res.json(apiRes);
      } else {
        res.json("noresult");
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Check quantity ==================================//

  checkquantity: async (req, res, next) => {
    try {
      let check = false;
      let prods = [];
      const orderData = await orderModel
        .findOne({
          _id: req.body.id,
          userid: res.locals.userdata._id,
          order_status: "pending",
        })
        .populate("products.product_id");
      for (let i = 0; i < orderData.products.length; i++) {
        if (
          orderData.products[i].qnty > orderData.products[i].product_id.stock
        ) {
          check = true;
          prods.push(orderData.products[i].product_id.name);
        }
      }
      if (check == true) {
        res.json({ exist: prods });
      } else {
        res.json("Unique");
      }
    } catch (error) {
      next(error);
    }
  },

  //============== Check Out form (COD,ONLINE PAYMENT,WALLET) ==============//

  checkoutform: async (req, res, next) => {
    try {
      if (req.body.flexRadioDefault == "COD") {
        if (req.params.id) {
          const order = await orderModel.findOne({
            _id: req.params.id,
            userid: res.locals.userdata._id,
            order_status: "pending",
          });
          if (order.coupon.name) {
            await couponModel.updateOne(
              { couponName: order.coupon.name },
              {
                $addToSet: {
                  couponUser: res.locals.userdata._id,
                },
              }
            );
          }
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
                    order_status: "completed",
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

                res.json("COD");
              })
              .catch((err) => {
                next(err);
              });
          }
        }
      } else if (req.body.flexRadioDefault == "Wallet") {
        if (req.params.id) {
          const order = await orderModel.findOne({
            _id: req.params.id,
            userid: res.locals.userdata._id,
            order_status: "pending",
          });
          const user = await userModel.findOne({
            _id: res.locals.userdata._id,
          });
          const total = Math.round(
            order.bill_amount -
              (order.bill_amount * order.coupon.discount) / 100
          );
          if (user.wallet > total) {
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
                      order_status: "completed",
                      "payment.payment_status": "completed",
                      "payment.payment_id": "Wallet_" + req.params.id,
                      "payment.payment_order_id": "Wallet_OID",
                      "payment.payment_method": "Wallet_payment",
                      "delivery_status.ordered.state": true,
                      "delivery_status.ordered.date": Date.now(),
                    },
                  }
                )
                .then(async () => {
                  await userModel.updateOne(
                    { _id: res.locals.userdata._id },
                    { $inc: { wallet: -total } },
                    { $set: { cart: [] } }
                  );

                  res.json("Wallet");
                })
                .catch((err) => {
                  next(err);
                });
            }
          } else {
            res.json("Not Enough cash");
          }
        }
      } else {
        if (req.params.id) {
          const order = await orderModel.findOne({
            _id: req.params.id,
            userid: res.locals.userdata._id,
            order_status: "pending",
          });

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
                  },
                }
              )
              .then(async () => {
                await userModel.updateOne(
                  { _id: res.locals.userdata._id },
                  { $set: { cart: [] } }
                );
                let total = order.bill_amount * 100;
                instance.orders
                  .create({
                    amount: total,
                    currency: "INR",
                    receipt: "" + order._id,
                  })
                  .then((order) => {
                    res.json({ field: order, key: process.env.RAZ_KEY_ID });
                  });
              })
              .catch((err) => {
                next(err);
              });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ VerifyPayment ==================================//

  verifypayment: (req, res, next) => {
    try {
      const response = JSON.parse(req.body.orders);
      let hamc = crypto.createHmac("sha256", process.env.RAZ_SECRET_KEY);
      hamc.update(response.raz_oid + "|" + response.raz_id);
      hamc = hamc.digest("hex");
      if (hamc == response.raz_sign) {
        orderModel
          .updateOne(
            { _id: response.id },
            {
              $set: {
                order_status: "completed",
                "payment.payment_status": "completed",
                "payment.payment_id": response.raz_id,
                "payment.payment_order_id": response.raz_oid,
                "payment.payment_method": "Online_payment",
                "delivery_status.ordered.state": true,
                "delivery_status.ordered.date": Date.now(),
              },
            }
          )
          .then(() => {
            res.json("ONLINEPAYMENT");
          });
      } else {
        res.json("failed");
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ order success page ==================================//

  orderSuccess: (req, res, next) => {
    try {
      res.render("user/orderSuccess", { page: "none", user: req.session.user });
    } catch (error) {
      next(error);
    }
  },

  //================================ order Details ==================================//

  orderDetails: (req, res, next) => {
    try {
      orderModel
        .find({
          userid: res.locals.userdata._id,
          order_status: { $ne: "pending" },
        })
        .sort({ ordered_date: -1 })
        .then((orderDetails) => {
          res.render("user/orderDetails", {
            page: "Account",
            orderDetails,
            user: req.session.user,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  //================================ View Order ==================================//

  viewOrder: (req, res, next) => {
    try {
      orderModel
        .findOne({ _id: req.params.id, userid: res.locals.userdata._id })
        .populate("products.product_id")
        .then((orderDetails) => {
          res.render("user/ViewOrder", {
            page: "Account",
            orderDetails,
            user: req.session.user,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  //================================ User details edit==================================//

  userdetails: (req, res, next) => {
    try {
      let dataUpdate = {};
      let apiRes = {};
      switch (JSON.parse(req.body.num)) {
        case 1:
          dataUpdate = {
            userName: req.body.key,
          };
          apiRes.success = true;
          apiRes.message = "UserName updated";
          break;
        case 2:
          dataUpdate = {
            email: req.body.key,
          };
          req.session.useremail = req.body.key;
          apiRes.success = true;
          apiRes.message = "Email updated";
          break;
        case 3:
          if (req.body.key.length == 10) {
            dataUpdate = {
              phone: req.body.key,
            };
            apiRes.success = true;
            apiRes.message = "Phonenumber updated";
          } else {
            apiRes.message = "Please enter valied phonenumber";
          }
          break;
        default:
          apiRes.message = "Network Error";
      }
      userModel
        .updateOne({ _id: res.locals.userdata._id }, { $set: dataUpdate })
        .then(() => {
          res.json(apiRes);
        });
    } catch (error) {
      next(error);
    }
  },

  //================================ Cancel Orders ==================================//

  cancelOrder: (req, res, next) => {
    try {
      orderModel
        .updateOne(
          { _id: req.body.id },
          {
            $set: {
              order_status: "canceled",
              "delivery_status.canceled.state": true,
              "delivery_status.canceled.date": Date.now(),
            },
          }
        )
        .then(() => {
          res.json("Ordercanceled");
        });
    } catch (error) {
      next(error);
    }
  },

  //================================ Product Reviews ==================================//

  ProductReview: (req, res, next) => {
    try {
      let review = reviewModel({
        product_id: req.params.id,
        userid: res.locals.userdata._id,
        title: req.body.title,
        review: req.body.review,
        rating: req.body.star,
      });
      review.save().then(() => {
        res.redirect("/viewOrder/" + req.body.orderId);
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Wallet Balance Check ==================================//

  walletCheck: (req, res, next) => {
    try {
      userModel.findOne({ _id: res.locals.userdata._id }).then((user) => {
        if (user.wallet > req.body.finalAmount) {
          res.json("success");
        } else {
          res.json(user);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  //================================ Return Orderes ==================================//

  returnOrder: (req, res, next) => {
    try {
      if (req.params.id) {
        orderModel
          .updateOne(
            { _id: req.params.id },
            {
              $set: {
                order_status: "returned",
                "delivery_status.returned.state": true,
                "delivery_status.returned.date": Date.now(),
              },
            }
          )
          .then(() => {
            res.json("Success");
          });
      } else {
        res.json("false");
      }
    } catch (error) {
      next(error);
    }
  },

  //================================ Count Cart and wallet in buttons ==================================//

  count: (req, res, next) => {
    try {
      userModel.findOne({ _id: res.locals.userdata._id }).then((user) => {
        res.json(user);
      });
    } catch (error) {
      next(error);
    }
  },
  about: (req, res, next) => {
    try {
      res.render("user/about", { page: "about", user: req.session.user });
    } catch (error) {
      next(error);
    }
  },

  //================================ Wallet History ==================================//

  walletHistory: (req, res, next) => {
    try {
      orderModel
        .aggregate([
          {
            $match: {
              $and: [
                { userid: res.locals.userdata._id },
                { "payment.payment_method": "Wallet_payment" },
              ],
            },
          },
        ])
        .then((data) => {
          res.render("user/walletHistory", {
            page: "Account",
            user: req.session.user,
            data,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  // ============================== change password page=================================//

  changepassword:(req,res,next)=>{
    try {
      console.log("INSIDE CHANGE");
      res.render('user/changePassword',{ page: "Account",user: req.session.user})
    } catch (error) {
      console.log(Error);
      next(error)
    }
  },

  // ============================== change password =================================//

  changepass:async(req,res,next)=>{
    try {
      let apiRes={}
    if(req.body.num==1){
      if(req.body.key){
        const user=await userModel.findOne({_id:res.locals.userdata._id})
        const isPass = await bcrypt.compare(req.body.key, user.password);
        if(isPass){
          apiRes.success=true
          apiRes.message="Enter New Password"
          res.json(apiRes)
        }else{
          apiRes.message="Incorrect Password"
          res.json(apiRes)
        }
      }else{
        apiRes.message="Enter Password "
        res.json(apiRes)
      }
    }else{
      if(req.body.key  && req.body.key.length>=8){
        let pass=await bcrypt.hash(req.body.key, 10);
        userModel.updateOne({_id:res.locals.userdata._id},{$set:{password:pass}}).then((data)=>{
        res.json("Success")
        })
      }
      else{
        apiRes.message="password must be 8 letter"
        res.json(apiRes)
      }
    }
    } catch (error) {
      next(error)
    }
  },

  //================================ User Loginout ==================================//

  logout: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
};
