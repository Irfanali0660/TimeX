const express = require("express");
const router = express.Router();
const { userSession, loginSession } = require("../middleware/auth");
const { ajaxSession } = require("../middleware/ajax");
const {
  home,
  loginget,
  signup,
  logout,
  shop,
  productdetials,
  getModal,
  cart,
  wishlist,
  account,
  checkout,
  orderDetails,
  viewOrder,
  login,
  otp,
  verifyotp,
  resendOTP,
  addtocart,
  quantity,
  deletecart,
  quantitydec,
  addaddress,
  editaddress,
  updateaddress,
  deleteaddress,
  couponcheck,
  selectaddress,
  orderid,
  count,
  searchFun,
  checkoutform,
  addwishlist,
  deleteitem,
  userdetails,
  cancelOrder,
  ProductReview,
  orderSuccess,
  verifypayment,
  walletCheck,
  returnOrder,
  checkquantity,
  about,
  walletHistory,
  changepassword,
  changepass
} = require("../controllers/usercontrol");

router.get("/", home);
router.get("/login", loginSession, loginget);
router.get("/signup", loginSession, signup);
router.get("/userlogout", logout);
router.get("/shop", shop);
router.get("/productdetials/:id/:val", productdetials);
router.post("/getModal", getModal);
router.get("/cart", userSession, cart);
router.get("/wishlist", userSession, wishlist);
router.get("/account", userSession, account);
router.get("/checkout/:id", userSession, checkout);
router.get("/orderDetails", userSession, orderDetails);
router.get("/viewOrder/:id", userSession, viewOrder);
router.get("/orderSuccess", userSession, orderSuccess);
router.get("/count", userSession, count);
router.get("/about", about);
router.get("/walletHistory",userSession, walletHistory);
router.get('/changepassword',userSession,changepassword)

router.post("/login", login);


router.post("/otp",loginSession,otp);
router.post("/verifyotp",loginSession,verifyotp);
router.get("/resendotp", resendOTP);
router.post("/addtocart", ajaxSession, addtocart);
router.post("/quantity", ajaxSession, quantity);
router.post("/quantitydec", ajaxSession, quantitydec);
router.post("/deletecart", ajaxSession, deletecart);
router.post("/addaddress", userSession, addaddress);
router.post("/editaddress", ajaxSession, editaddress);
router.post("/updateaddress/:id", userSession, updateaddress);
router.post("/deleteaddress", ajaxSession, deleteaddress);
router.post("/couponcheck", ajaxSession, couponcheck);
router.post("/selectaddress", ajaxSession, selectaddress);
router.post("/couponcheck", ajaxSession, couponcheck);
router.post("/orderid", userSession, orderid);
router.post("/searchFun", searchFun);
router.post("/checkoutform/:id", userSession, checkoutform);
router.post("/cancelOrder", ajaxSession, cancelOrder);
router.post("/Productreview/:id", userSession, ProductReview);
router.post("/verifypayment", ajaxSession, verifypayment);
router.post("/walletCheck", ajaxSession, walletCheck);
router.post("/returnOrder/:id", ajaxSession, returnOrder);
router.post("/checkquantity", ajaxSession, checkquantity);
router.post('/changepass',ajaxSession,changepass)
router.post("/addwishlist", ajaxSession, addwishlist);
router.post("/userdetails", ajaxSession, userdetails);

router.put("/deleteitem", ajaxSession, deleteitem);

module.exports = router;
