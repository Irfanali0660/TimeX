const express = require("express");
const router = express.Router();
const {userSession} = require("../middleware/auth");
const adminsession = require("../middleware/auth");
const { ajaxSession } = require("../middleware/ajax");
const {home,
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
    login,otp,
    verifyotp,resendOTP,
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
    searchFun,
    checkoutform,
    addwishlist,
    deleteitem,
    userdetails,
    cancelOrder,
    ProductReview,
    orderSuccess,
    verifypayment,
    walletCheck} = require("../controllers/usercontrol");




router.get("/", home);
router.get("/login",loginget);
router.get("/signup",signup);
router.get("/userlogout",logout);
router.get("/shop",shop);
router.get("/productdetials/:id/:val",productdetials);
router.post("/getModal", getModal);
router.get("/cart", userSession,cart);
router.get("/wishlist", userSession, wishlist);
router.get("/account", userSession, account);
router.get("/checkout/:id", userSession, checkout);
router.get('/orderDetails', userSession, orderDetails)
router.get('/viewOrder/:id',userSession, viewOrder)
router.get('/orderSuccess',userSession, orderSuccess)

router.post("/login",login);



router.post("/otp", otp);
router.post("/verifyotp", verifyotp);
router.get("/resendotp", resendOTP);
router.post("/addtocart", ajaxSession,addtocart);
router.post("/quantity", ajaxSession,quantity);
router.post("/quantitydec", ajaxSession,quantitydec);
router.post("/deletecart", ajaxSession, deletecart);
router.post("/addaddress", userSession, addaddress);
router.post("/editaddress", ajaxSession, editaddress);
router.post("/updateaddress/:id", userSession, updateaddress);
router.post("/deleteaddress", ajaxSession, deleteaddress);
router.post("/couponcheck", ajaxSession, couponcheck);
router.post("/selectaddress", ajaxSession, selectaddress);
router.post("/couponcheck", ajaxSession,couponcheck);
router.post("/orderid", userSession, orderid);
router.post("/searchFun", searchFun);
// router.post('/addaddresscheck',userSession,addaddresscheck)
router.post("/checkoutform/:id",userSession, checkoutform);
router.post('/cancelOrder',ajaxSession,cancelOrder);
router.post('/Productreview/:id',userSession,ProductReview)
router.post('/verifypayment',ajaxSession,verifypayment)
router.post('/walletCheck',ajaxSession,walletCheck)


router.post("/addwishlist", ajaxSession,addwishlist);
router.put("/deleteitem", ajaxSession, deleteitem);
router.post('/userdetails',ajaxSession,userdetails)
// router.put('/editbill', controller.editbill)

module.exports = router;
