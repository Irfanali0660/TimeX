const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");

module.exports = {
    userSession: async(req, res, next) => {
      
         if (req.session.userlogged) {
            console.log("INSIDE NEXT");
            res.locals.userdata=await userModel.findOne({email: req.session.useremail})
            if( res.locals.userdata.status=="banned"){
                console.log("INSIDE BAnned");
                return res.render('user/login',{userSts: res.locals.userdata.status,userName:"correct"});
            }
            else{
                next()
            }  
        }
        else {
            res.redirect('/login')
        }
    },
    adminSession:async (req, res, next) => {
        if (req.session.adminLogin) {
            console.log("INSIDE ADMINSESSOn");
            res.locals.admindata=await adminModel.findOne({email: req.session.adminemail})
            next()
        }
        else {
            res.redirect('/adminlogin')
        }
    },
    homesession:async(req,res,next)=>{
        if (req.session.userlogged) {
            console.log("INSIDE NEXT");
            res.locals.userdata=await userModel.findOne({email: req.session.useremail})
            next()
        }else{
           res.redirect('/')
        }
    },
};