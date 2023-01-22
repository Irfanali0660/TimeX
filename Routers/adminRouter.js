const express = require('express');
const router =express.Router()
const auth = require('../middleware/auth');
const adminsession=require('../middleware/auth');
const multer= require('multer');
const {
  dashbord,
  customers,
  products,
  addProducts,
  deleteimage,
  editproducts,
  category,
  addcategory,
  updatecategory,
  banner,
  addbanner,
  coupon,
  ordermanagement,
  orderlist,
  block,unblock,
  deleteuser,
  deleteproduct,
  addprodcut,
  updateProduct,
  addcategorydetials,
  Updatecategories,
  deletecategories,
  AddBanner,
  disable,
  enable,
  deletebanner,
  addcoupon,
  deleteCoupon,
  updatecoupon,
  ajaxcoupon,
  delivarystatus,
  logout,
  adminlogin,
  login,
  paymentpending,
  invoice} = require('../controllers/admincontrol');




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


 router.get('/adminlogin',adminlogin);


 router.get('/dashbord',auth.adminSession,dashbord);
 router.get('/customers',auth.adminSession,customers);
 router.get('/products',auth.adminSession,products);
 router.get('/addproduct',auth.adminSession,addProducts)
//  router.get('/editproduct',auth.adminSession,controller.editproduct);
 router.get('/deleteimage/:id/:val',auth.adminSession,deleteimage)
 router.get('/editproduct/:id',auth.adminSession,editproducts);
 router.get('/category',auth.adminSession,category)
 router.get('/addcategory',auth.adminSession,addcategory)
 router.get('/updatecategory/:id',auth.adminSession,updatecategory)
 router.get('/Banners',auth.adminSession,banner)
 router.get('/Addbanner',auth.adminSession,addbanner)
 router.get('/coupon',auth.adminSession,coupon)
 router.get('/order',auth.adminSession,ordermanagement)
 router.get('/orderlist/:id',auth.adminSession,orderlist)
 router.get('/orderinvoice/:id',auth.adminSession,invoice)

 
 

 router.get('/logout',logout);



router.post('/adminlogin',login)
router.post('/blockUser/:id',auth.adminSession,block);
router.post('/unblockUser/:id',auth.adminSession,unblock)
router.post('/deleteuser/:id',auth.adminSession,deleteuser)
router.post('/deleteproduct/:id',auth.adminSession,deleteproduct)
router.post('/addproduct',auth.adminSession,uploadOptions.array('product_images',10),addprodcut)
router.post('/updateproduct/:id',auth.adminSession,uploadOptions.array('product_images',10),updateProduct);
router.post('/addcategorydetials',auth.adminSession,uploadOptions.single('product_images',10),addcategorydetials)
router.post('/Updatecategories/:id/:val',auth.adminSession,uploadOptions.single('product_images',10),Updatecategories)
router.post('/deletecategories/:id/:val',auth.adminSession,deletecategories)
router.post('/addbanner',auth.adminSession,uploadOptions.single('product_images',10),AddBanner)
router.post('/disablebanner/:id',auth.adminSession,disable)
router.post('/enablebanner/:id',auth.adminSession, enable);
router.post('/deletebanner/:id/:val',auth.adminSession, deletebanner)
router.post('/addcoupon',auth.adminSession, addcoupon)
router.post('/deleteCoupon/:id',auth.adminSession, deleteCoupon)
router.post('/updateCoupon/:id',auth.adminSession, updatecoupon)
router.post('/editcoupon', ajaxcoupon)
router.post('/delivarystatus',delivarystatus)



router.put('/paymentpending',paymentpending)


module.exports =router;