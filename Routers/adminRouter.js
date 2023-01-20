const express = require('express');
const router =express.Router()

const controller = require('../controllers/admincontrol');
const auth = require('../middleware/auth');
const adminsession=require('../middleware/auth');
const multer= require('multer');

// router.use((req,res,next)=>{
//     req.app.set('layout',path.join(__dirname,'../../views/layout/adminlayout'))
//     next()
//  }) 
const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error('invalid image type')

    if(isValid){
      uploadError = null
    }
    console.log("INSIDE MULTER");
    cb(uploadError, './public/productimages')
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`)
  }
})
const uploadOptions = multer({ storage:storage})


 router.get('/adminlogin',controller.adminlogin);


 router.get('/dashbord',auth.adminSession,controller.dashbord);
 router.get('/customers',auth.adminSession,controller.customers);
 router.get('/products',auth.adminSession,controller.products);
 router.get('/addproduct',auth.adminSession,controller.addProducts)
//  router.get('/editproduct',auth.adminSession,controller.editproduct);
 router.get('/deleteimage/:id/:val',auth.adminSession,controller.deleteimage)
 router.get('/editproduct/:id',auth.adminSession,controller.editproducts);
 router.get('/category',auth.adminSession,controller.category)
 router.get('/addcategory',auth.adminSession,controller.addcategory)
 router.get('/updatecategory/:id',auth.adminSession,controller.updatecategory)
 router.get('/Banners',auth.adminSession,controller.banner)
 router.get('/Addbanner',auth.adminSession,controller.addbanner)
 router.get('/coupon',auth.adminSession,controller.coupon)
 router.get('/order',auth.adminSession,controller.ordermanagement)

 
 

 router.get('/logout',controller.logout);



router.post('/adminlogin',controller.login)
router.post('/blockUser/:id',auth.adminSession,controller.block);
router.post('/unblockUser/:id',auth.adminSession,controller.unblock)
router.post('/deleteuser/:id',auth.adminSession,controller.deleteuser)
router.post('/deleteproduct/:id',auth.adminSession,controller.deleteproduct)
router.post('/addproduct',auth.adminSession,uploadOptions.array('product_images',10),controller.addprodcut)
router.post('/updateproduct/:id',auth.adminSession,uploadOptions.array('product_images',10),controller.updateProduct);
router.post('/addcategorydetials',auth.adminSession,uploadOptions.single('product_images',10),controller.addcategorydetials)
router.post('/Updatecategories/:id/:val',auth.adminSession,uploadOptions.single('product_images',10),controller.Updatecategories)
router.post('/deletecategories/:id/:val',auth.adminSession,controller.deletecategories)
router.post('/addbanner',auth.adminSession,uploadOptions.single('product_images',10),controller.AddBanner)
router.post('/disablebanner/:id',auth.adminSession,controller.disable)
router.post('/enablebanner/:id',auth.adminSession, controller.enable);
router.post('/deletebanner/:id/:val',auth.adminSession, controller.deletebanner)
router.post('/addcoupon',auth.adminSession, controller.addcoupon)
router.post('/deleteCoupon/:id',auth.adminSession, controller.deleteCoupon)
router.post('/updateCoupon/:id',auth.adminSession, controller.updatecoupon)
router.post('/editcoupon', controller.ajaxcoupon)




module.exports =router;