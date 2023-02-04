const express = require('express');
const router =express.Router()
const {adminSession} = require('../middleware/auth');
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
  invoice,
  salesReport,
  salesDetails,
  refundcash} = require('../controllers/admincontrol');
const { ajaxSession } = require('../middleware/ajax');

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


 router.get('/dashbord',adminSession,dashbord);
 router.get('/customers',adminSession,customers);
 router.get('/products',adminSession,products);
 router.get('/addproduct',adminSession,addProducts)
 router.get('/deleteimage/:id/:val',adminSession,deleteimage)
 router.get('/editproduct/:id',adminSession,editproducts);
 router.get('/category',adminSession,category)
 router.get('/addcategory',adminSession,addcategory)
 router.get('/updatecategory/:id',adminSession,updatecategory)
 router.get('/Banners',adminSession,banner)
 router.get('/Addbanner',adminSession,addbanner)
 router.get('/coupon',adminSession,coupon)
 router.get('/order',adminSession,ordermanagement)
 router.get('/orderlist/:id',adminSession,orderlist)
 router.get('/orderinvoice/:id',adminSession,invoice)
 router.get('/salesReport',adminSession,salesReport)
 
 

 router.get('/logout',logout);



router.post('/adminlogin',login)
router.post('/blockUser/:id',adminSession,block);
router.post('/unblockUser/:id',adminSession,unblock)
router.post('/deleteproduct/:id',adminSession,deleteproduct)
router.post('/addproduct',adminSession,uploadOptions.array('product_images',10),addprodcut)
router.post('/updateproduct/:id',adminSession,uploadOptions.array('product_images',10),updateProduct);
router.post('/addcategorydetials',adminSession,uploadOptions.single('product_images',10),addcategorydetials)
router.post('/Updatecategories/:id/:val',adminSession,uploadOptions.single('product_images',10),Updatecategories)
router.post('/deletecategories/:id/:val',adminSession,deletecategories)
router.post('/addbanner',adminSession,uploadOptions.single('product_images',10),AddBanner)
router.post('/disablebanner/:id',adminSession,disable)
router.post('/enablebanner/:id',adminSession, enable);
router.post('/deletebanner/:id/:val',adminSession, deletebanner)
router.post('/addcoupon',adminSession, addcoupon)
router.post('/deleteCoupon/:id',adminSession, deleteCoupon)
router.post('/updateCoupon/:id',adminSession, updatecoupon)
router.post('/editcoupon', ajaxcoupon)
router.post('/delivarystatus',delivarystatus)
router.post('/salesDetails',adminSession,salesDetails)
router.post('/refundcash',refundcash)


router.put('/paymentpending',paymentpending)


module.exports =router;