const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");

module.exports = {
  userSession: async (req, res, next) => {
    if (req.session.userlogged) {
      res.locals.userdata = await userModel.findOne({
        email: req.session.useremail,
      });
      if (res.locals.userdata.status == "banned") {
        return res.render("user/login", {
          userSts: res.locals.userdata.status,
          userName: "correct",
        });
      } else {
        next();
      }
    } else {
      res.redirect("/login");
    }
  },
  loginSession: async (req, res, next) => {
    if (req.session.userlogged) {
      res.redirect("/");
    } else {
      next();
    }
  },

  adminSession: async (req, res, next) => {
    if (req.session.adminLogin) {
      res.locals.admindata = await adminModel.findOne({
        email: req.session.adminemail,
      });
      next();
    } else {
      res.redirect("/adminlogin");
    }
  },
};
