const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
// const multer = require('multer');
const ProductModel = require("../model/ProductModel");
const fs = require("fs");
const path = require("path");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel");
const couponModel = require("../model/couponModel");
const orderModel = require("../model/orderModel");
// const bcrypt = require('bcrypt');
// const collection = require('../module/collection');

module.exports = {

//===============DashBord=================//

  dashbord: async (req, res,next) => {
   try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    let salesChart = await orderModel.aggregate([
      {
        $match: {
          order_status: { $ne: "pending" },
          ordered_date: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ordered_date" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    let Orderpending = await orderModel.countDocuments({
      order_status: "pending",
    });
    let Ordercanceled = await orderModel.countDocuments({
      order_status: "canceled",
    });
    let paymentpending = await orderModel.countDocuments({
      "payment.payment_status": "pending",
    });
    let paymentpaid = await orderModel.countDocuments({
      "payment.payment_status": "completed",
    });

    let product = await productModel.find().count();
    let category = await categoryModel.find().count();
    let order = await orderModel
      .find({ order_status: { $ne: "pending" } })
      .count();
    let user = await userModel.find().count();
    orderModel
      .find({ order_status: { $ne: "pending" } })
      .populate("userid")
      .sort({ ordered_date: -1 })
      .limit(10)
      .then((orders) => {
        res.render("admin/admin_dashbord", {
          page: "dashbord",
          admin: res.locals.admindata.name,
          orders,
          product,
          category,
          order,
          user,
          salesChart,
          Orderpending,
          Ordercanceled,
          paymentpending,
          paymentpaid,
        });
      });
   } catch (error) {
    next(error)
   }
  },

  //  ======================AdminLogin====================== //

  login: async (req, res,next) => {
try {
  if (req.session.adminLogin) {
    res.redirect("/dashbord");
  }
  const { email, password } = req.body;
  const ademail = await adminModel.findOne({ email });
  if (!ademail) {
    return res.render("admin/adminlogin", { notAdmin: "true" });
  }
  const adpass = await adminModel.findOne({ password });
  if (!adpass) {
    return res.render("admin/adminlogin", { notAdmin: "true" });
  }
  req.session.adminLogin = true;
  req.session.adminemail = req.body.email;
  res.redirect("/dashbord");
} catch (error) {
  next(error)
}
  },

// =======================productspage===========================  //

  products: async (req, res, next) => {
    try {
      const products = await ProductModel.find().populate("brand");
      res.render("admin/admin_products", {
        page: "Products",
        products,
        admin: res.locals.admindata.name,
      });
    } catch (error) {
      next(error);
    }
  },

  //  ======================addProductsPage============================ //

  addProducts: async (req, res, next) => {
    try {
      let category = await categoryModel.find();
      res.render("admin/admin_addProduct", {
        page: "Products",
        admin: res.locals.admindata.name,
        field: "field",
        userstatus: "false",
        category,
      });
    } catch (error) {
      next(error);
    }
  },

//  ==========================addProducts==================================  //

  addprodcut: async (req, res, next) => {
    try {
      let category = await categoryModel.find();
      const filenames = req.files.map((file) => file.filename);
      if (
        req.body.name &&
        req.body.description &&
        req.body.shortdescription &&
        req.body.price &&
        req.body.brand &&
        req.body.stock &&
        req.body.status &&
        filenames
      ) {
        let product = ProductModel({
          name: req.body.name,
          description: req.body.description,
          shortDescription: req.body.shortdescription,
          price: req.body.price,
          brand: req.body.brand,
          stock: req.body.stock,
          status: req.body.status,
          image: filenames,
        });
        product.save().then(() => {
          res.render("admin/admin_addProduct", {
            page: "Products",
            admin: res.locals.admindata.name,
            field: "field",
            userstatus: "true",
            category,
          });
        });
      } else {
        res.render("admin/admin_addProduct", {
          page: "Products",
          admin: res.locals.admindata.name,
          field: "no field",
          userstatus: "false",
          category,
        });
      }
    } catch (error) {
      next(error);
    }
  },

//   ====================delete Products====================== //

  deleteproduct: async (req, res, next) => {
    try {
      const id = req.params.id;
      const product = await ProductModel.findOne({ _id: id });
      product.image.forEach((value) => {
        fs.unlink(
          path.join(__dirname, "../public/productimages/", value),
          () => {
          }
        );
      });
      ProductModel.deleteOne({ _id: id }).then(() => {
        res.redirect("/products");
      });
    } catch (error) {
      next(error);
    }
  },

 // =================Edit Product Page===================== //

  editproduct: (req, res) => {
    res.render("admin/admin_productEdit", {
      page: "Products",
      admin: res.locals.admindata.name,
      field: "field",
    });
  },

// ==================edit Products Page=========================== //

  editproducts: async (req, res,next) => {
    try {
      const id = req.params.id;
    let products = await ProductModel.findOne({ _id: id }).populate("brand");
    let category = await categoryModel.find();
    res.render("admin/admin_productEdit", {
      page: "Products",
      admin: res.locals.admindata.name,
      field: "field",
      products,
      category,
      userstatus: "false",
    });
    } catch (error) {
      next(error)
    }
  },

  // ==========================Delete single Image=============================== //

  deleteimage: async (req, res,next) => {
  try {
    const val = req.params.val;
    const id = req.params.id;
    fs.unlink(path.join(__dirname, "../public/productimages/", val), () => {});
    await productModel.updateOne({ _id: id }, { $pull: { image: val } });
    res.redirect("/editproduct/" + id);
  } catch (error) {
    next(error)
  }
  },

  // ============================edit products============================ //

  updateProduct: async (req, res, next) => {
    try {
      const id = req.params.id;
      const filenames = req.files.map((file) => file.filename);
      let dataToUpdate = {
        name: req.body.name,
        description: req.body.description,
        shortDescription: req.body.shortdescription,
        price: req.body.price,
        brand: req.body.brand,
        stock: req.body.stock,
        status: req.body.status,
      };
      if (req.files.length > 0) {
        ProductModel.updateOne(
          { _id: id },
          { $push: { image: { $each: filenames } } }
        )
      }
      let category = await categoryModel.find();
      products = await ProductModel.findOneAndUpdate(
        { _id: id },
        { $set: dataToUpdate }
      );
      res.render("admin/admin_productEdit", {
        page: "Products",
        admin: res.locals.admindata.name,
        field: "field",
        category,
        products,
        userstatus: "true",
      });
    } catch (error) {
      next(error);
    }
  },

  // ===============Users Lists==================== //

  customers: async (req, res, next) => {
    try {
      const users = await userModel.find();
      res.render("admin/admin_customers", {
        page: "customers",
        users,
        admin: res.locals.admindata.name,
      });
    } catch (error) {
      next(error);
    }
  },

// ======================admin Login===================== //

  adminlogin: (req, res) => {
    if (req.session.adminLogin) {
      res.redirect("/dashbord");
    }
    res.render("admin/adminlogin", { notAdmin: "false" });
  },

  //======================Block Users======================//

  block: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { status: "banned" } })
        .then(() => {
          res.redirect("/customers");
        });
    } catch (error) {
      next(error);
    }
  },

  //====================Unblock Users============================//

  unblock: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { status: "unbanned" } })
        .then(() => {
          res.redirect("/customers");
        });
    } catch (error) {
      next(error);
    }
  },



//   deleteuser: async (req, res, next) => {
//     try {
//       const id = req.params.id;
//       await userModel.deleteOne({ _id: id }).then(() => {
//         res.redirect("/customers");
//       });
//     } catch (error) {
//       next(error);
//     }
//   },

 //====================Category Page=====================//

  category: async (req, res) => {
  try {
    let Categories = await categoryModel.find();
    res.render("admin/admin_category", {
      page: "category",
      admin: res.locals.admindata.name,
      Categories,
    });
  } catch (error) {
    next(error)
  }
  },

  //======================Add Category page=======================//

  addcategory: (req, res) => {
  try {
    res.render("admin/admin_addCategory", {
      page: "category",
      admin: res.locals.admindata.name,
      ustatus: "no",
    });
  } catch (error) {
    next(error)
  }
  },

  //====================Add categorys======================//

  addcategorydetials: async (req, res, next) => {
    try {
      let Cname = req.body.category.toLowerCase();
      let catecheck = await categoryModel.findOne({ categoryName: Cname });
      if (!catecheck) {
        let categorys = categoryModel({
          categoryName: Cname,
          date: req.body.Date,
          status: req.body.status,
          image: req.file.filename,
        });
        categorys.save().then(() => {
          res.render("admin/admin_addCategory", {
            page: "category",
            admin: res.locals.admindata.name,
            ustatus: "true",
          });
        });
      } else {
        res.render("admin/admin_addCategory", {
          page: "category",
          admin: res.locals.admindata.name,
          ustatus: "false",
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // =====================Update Category Page========================= //

  updatecategory: async (req, res) => {
   try {
    id = req.params.id;
    let Categories = await categoryModel.findOne({ _id: id });
    res.render("admin/admin_updateCategory", {
      page: "category",
      admin: res.locals.admindata.name,
      ustatus: "false",
      Categories,
    });
   } catch (error) {
    next(error)
   }
  },

//   ======================Update categorys=========================== //

  Updatecategories: async (req, res, next) => {
    try {
      const id = req.params.id;
      const val = req.params.val;
      const cname = req.body.category.toLowerCase();
      let cateToUpdate = {
        categoryName: cname,
        date: req.body.Date,
        status: req.body.status,
      };
      if (req.file) {
        fs.unlink(
          path.join(__dirname, "../public/productimages/", val),
          () => {}
        );
        cateToUpdate.image = req.file.filename;
      }
      await categoryModel.findOneAndUpdate(
        { _id: id },
        { $set: cateToUpdate }
      );
      res.redirect("/category");
    } catch (error) {
      next(error);
    }
  },

  //  ===================Delete Categorys=========================  //

  deletecategories: async (req, res) => {
    try {
      const id = req.params.id;
      const img = req.params.val;
      await categoryModel.findOne({ _id: id });
      fs.unlink(path.join(__dirname, "../public/productimages/", img), () => {
      });

      categoryModel.deleteOne({ _id: id }).then(() => {
        res.redirect("/category");
      });
    } catch (error) {
      next(error);
    }
  },

  //==========================Banner Page==============================//

  banner: async (req, res) => {
    try {
      const banner = await bannerModel.find();
      res.render("admin/banner", {
        page: "banner",
        admin: res.locals.admindata.name,
        banner,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================Add Banner page============================== //

  addbanner: (req, res) => {
   try {
    res.render("admin/addBanner", {
      page: "banner",
      admin: res.locals.admindata.name,
      ustatus: "no",
    });
   } catch (error) {
    next(error)
   }
  },

  //=========================Add Banner==============================//

  AddBanner: (req, res) => {
    try {
      if (req.body.banner && req.file.filename) {
        let banner = bannerModel({
          bannerName: req.body.banner,
          description: req.body.description,
          image: req.file.filename,
        });
        banner.save().then(() => {
          res.render("admin/addBanner", {
            page: "banner",
            admin: res.locals.admindata.name,
            ustatus: "true",
          });
        });
      } else {
        res.render("admin/addBanner", {
          page: "banner",
          admin: res.locals.admindata.name,
          ustatus: "false",
        });
      }
    } catch (error) {
      next(error);
    }
  },

 //  ===============Disable banner================== //

  disable: async (req, res, next) => {
    try {
      const id = req.params.id;
      await bannerModel
        .updateOne({ _id: id }, { $set: { status: "false" } })
        .then(() => {
          res.redirect("/Banners");
        });
    } catch (error) {
      next(error);
    }
  },

  //=================Enable Banner======================//

  enable: async (req, res, next) => {
    try {
      const id = req.params.id;
      await bannerModel
        .updateOne({ _id: id }, { $set: { status: "true" } })
        .then(() => {
          res.redirect("/Banners");
        });
    } catch (error) {
      next(error);
    }
  },

  // ===================Delete Banners===================== ///

  deletebanner: async (req, res) => {
    try {
      const id = req.params.id;
      const img = req.params.val;
      await bannerModel.findOne({ _id: id });
      fs.unlink(path.join(__dirname, "../public/productimages/", img), () => {
      });

      bannerModel.deleteOne({ _id: id }).then(() => {
        res.redirect("/banners");
      });
    } catch (error) {
      next(error);
    }
  },

  // ========================Coupon Page=============================== //

  coupon: async (req, res, next) => {
    try {
      const id = req.body.id;
      const coupon = await couponModel.find();
      const singlecoupon = await couponModel.find({ _id: id });
      res.render("admin/coupon", {
        page: "coupon",
        admin: res.locals.admindata.name,
        coupon,
        singlecoupon,
      });
    } catch (error) {
      next(error);
    }
  },

  //===============Add coupon=================//

  addcoupon: async (req, res, next) => {
    try {
      const cpname = req.body.couponName.toLowerCase();
      const cpcheck = await couponModel.findOne({ couponName: cpname });
      if (!cpcheck) {
        let coupon = couponModel({
          couponName: cpname,
          couponCode: req.body.couponCode,
          percentage: req.body.percentage,
          expiryDate: req.body.expDate,
          minimumAmount: req.body.minimumAmount,
        });
        coupon.save().then(() => {
          res.redirect("/coupon");
        });
      } else {
        res.redirect("/coupon");
      }
    } catch (error) {
      next(error);
    }
  },

  //===================Delete coupon=====================//

  deleteCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      couponModel.deleteOne({ _id: id }).then(() => {
        res.redirect("/coupon");
      });
    } catch (error) {
      next(error);
    }
  },

  //=================Update Coupon======================//

  updatecoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const cname = req.body.couponName.toLowerCase();
      let coupToUpdate = {
        couponName: cname,
        couponCode: req.body.couponCode,
        percentage: req.body.percentage,
        expiryDate: req.body.expDate,
        minimumAmount: req.body.minimumAmount,
      };
      await couponModel.updateOne({ _id: id }, { $set: coupToUpdate });
      res.redirect("/coupon");
    } catch (error) {
      next(error);
    }
  },

  // =====================ajax Coupon Edit============================= //

  ajaxcoupon: async (req, res, next) => {
    try {
      let coupondet = await couponModel.findOne({ _id: req.body.id });
      res.json(coupondet);
    } catch (error) {
      next(error);
    }
  },

  //=================Order Management========================//

  ordermanagement: async (req, res, next) => {
    try {
      orderModel
        .find({ order_status: { $ne: "pending" } })
        .populate("userid")
        .sort({ ordered_date: -1 })
        .then((orders) => {
          res.render("admin/orderManagement", {
            page: "order",
            admin: res.locals.admindata.name,
            ustatus: "false",
            orders,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  // ==================Order List======================= //

  orderlist: (req, res, next) => {
    try {
      orderModel
        .findOne({ _id: req.params.id })
        .populate(["products.product_id", "userid"])
        .then((singleorder) => {
          res.render("admin/orderdetials", {
            page: "order",
            admin: res.locals.admindata.name,
            ustatus: "false",
            singleorder,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  // ================Delivary Status Update======================= //

  delivarystatus: (req, res, next) => {
    try {
      if (req.body.Status == "shipped") {
        orderModel
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                "delivery_status.shipped.state": true,
                "delivery_status.shipped.date": Date.now(),
              },
            }
          )
          .then((data) => {
            res.redirect("/orderlist/" + req.body.id);
          });
      } else if (req.body.Status == "out_for_delivery") {
        orderModel
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                "delivery_status.out_for_delivery.state": true,
                "delivery_status.out_for_delivery.date": Date.now(),
              },
            }
          )
          .then((data) => {
            res.redirect("/orderlist/" + req.body.id);
          });
      } else if (req.body.Status == "delivered") {
        orderModel
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                "delivery_status.delivered.state": true,
                "delivery_status.delivered.date": Date.now(),
              },
            }
          )
          .then((data) => {
            res.redirect("/orderlist/" + req.body.id);
          });
      } else {
        res.redirect("/orderlist/" + req.body.id);
      }
    } catch (error) {
      next(error);
    }
  },

  //====================Payment Pending========================//

  paymentpending: (req, res, next) => {
    try {
      orderModel
        .updateOne(
          { _id: req.body.id },
          { $set: { "payment.payment_status": "completed" } }
        )
        .then(() => {
          res.json("completed");
        });
    } catch (error) {
      next(error);
    }
  },

  //=====================Invoice==========================//

  invoice: (req, res, next) => {
    try {
      orderModel
        .findOne({ _id: req.params.id })
        .populate(["products.product_id", "userid"])
        .then((invoice) => {
          res.render("admin/orderinvoice", {
            page: "order",
            admin: res.locals.admindata.name,
            ustatus: "false",
            invoice,
          });
        });
    } catch (error) {
      next(error);
    }
  },

  //====================Sales Report========================//

  salesReport: (req, res, next) => {
    try {
      res.render("admin/salesReport", {
        page: "salesReport",
        admin: res.locals.admindata.name,
        ustatus: "false",
      });
    } catch (error) {
      next(error);
    }
  },

  //===================Sales Details=========================//

  salesDetails: async (req, res, next) => {
    try {
      if (req.body.selectoption == "sales") {
        let salesDetails = await orderModel.aggregate([
          {
            $match: {
              $and: [
                { order_status: "completed" },
                { "delivery_status.delivered.state": true },
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
        ]);
        res.render("admin/salesDetails", {
          page: "salesReport",
          admin: res.locals.admindata.name,
          ustatus: "false",
          salesDetails,
        });
      } else {
        let salesDetails = await orderModel.aggregate([
          {
            $match: {
              $and: [
                { order_status: "returned" },
                { "delivery_status.returned.state": true },
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
        ]);
        res.render("admin/salesDetails", {
          page: "salesReport",
          admin: res.locals.admindata.name,
          ustatus: "false",
          salesDetails,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  //=====================Refund Cash==========================//

  refundcash: async (req, res, next) => {
    try {
      let order = await orderModel.findOne({ _id: req.body.id });
      const total = Math.round(
        order.bill_amount - (order.bill_amount * order.coupon.discount) / 100
      );
      if (req.body.id) {
        orderModel
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                "payment.payment_status": "refund completed",
              },
            }
          )
          .then((data) => {
            userModel
              .updateOne(
                { _id: order.userid },
                {
                  $inc: {
                    wallet: total,
                  },
                }
              )
              .then(() => {
                res.json("success");
              });
          });
      } else {
        res.json("false");
      }
    } catch (error) {
      next(error);
    }
  },

  //======================AdminLogout========================//

  logout: (req, res, next) => {
    try {
      req.session.adminlogin = false;
      req.session.destroy();
      res.redirect("/adminlogin");
    } catch (error) {
      next(error);
    }
  },
}
