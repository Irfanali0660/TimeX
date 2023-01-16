const express = require('express');
const router =express.Router()

const controller = require('../controllers/usercontrol');
const auth = require('../middleware/auth');
const adminsession=require('../middleware/auth');
const ajax=require('../middleware/ajax')

// router.use((req,res,next)=>{
//     req.app.set('layout',path.join(__dirname,'../views/layout/userlayout'))
//     next()
//  }) 

router.get('/',controller.home);
router.get('/login',controller.loginget);
router.get('/signup',controller.signup);
router.get('/userlogout',controller.logout);
router.get('/shop',controller.shop);
router.get('/productdetials/:id/:val',controller.productdetials);
router.post('/getModal',controller.getModal);
router.get('/cart',auth.userSession,controller.cart);
router.get('/wishlist',auth.userSession,controller.wishlist);
router.get('/account',auth.userSession,controller.account);
router.get('/checkout',auth.userSession,controller.checkout);



router.post('/login',controller.login);

router.post('/otp',controller.otp);
router.post('/verifyotp',controller.verifyotp);
router.post('/resendotp',controller.resendOTP);
router.post('/addtocart',ajax.userSession,controller.addtocart)
router.post('/quantity',ajax.userSession,controller.quantity)
router.post('/quantitydec',ajax.userSession,controller.quantitydec)
router.post('/deletecart',ajax.userSession,controller.deletecart)
router.post('/addaddress',auth.userSession,controller.addaddress)
router.post('/editaddress',ajax.userSession,controller.editaddress)
router.post('/updateaddress/:id',auth.userSession,controller.updateaddress)
router.post('/deleteaddress',ajax.userSession,controller.deleteaddress)
router.post('/addwishlist',ajax.userSession,controller.addwishlist)
router.post('/deleteitem',ajax.userSession,controller.deleteitem)
router.post('/couponcheck',ajax.userSession,controller.couponcheck)
router.post('/selectaddress',ajax.userSession,controller.selectaddress)



module.exports =router;