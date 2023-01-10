const express = require('express');
const router =express.Router()

const controller = require('../controllers/usercontrol');
const auth = require('../middleware/auth');
const adminsession=require('../middleware/auth');

// router.use((req,res,next)=>{
//     req.app.set('layout',path.join(__dirname,'../views/layout/userlayout'))
//     next()
//  }) 
router.get('/',auth.userSession,controller.home);
router.get('/login',controller.loginget);
router.get('/signup',controller.signup);
// router.get('/otp',controller.otpget);
router.get('/userlogout',controller.logout);
router.get('/shop',auth.userSession,controller.shop);
router.get('/productdetials/:id/:val',auth.userSession,controller.productdetials)
router.post('/getModal',controller.getModal)


router.post('/login',controller.login)

router.post('/otp',controller.otp)
router.post('/verifyotp',controller.verifyotp);
router.post('/resendotp',controller.resendOTP);


module.exports =router;