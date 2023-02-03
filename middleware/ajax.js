const { login } = require("../controllers/admincontrol");
const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");

module.exports = {
  ajaxSession: async (req, res, next) => {
    if (req.session.userlogged) {
      res.locals.userdata = await userModel.findOne({
        email: req.session.useremail,
      });
      res.locals.userdata = await userModel.findOne({
        email: req.session.useremail,
      });
      next();
    } else {
      res.json("LOGIN FIRST");
    }
  },
};
