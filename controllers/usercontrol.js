const userModel = require("../model/userModel")
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const categoryModel = require("../model/categoryModel");
const { products, category } = require("./admincontrol");
const ProductModel = require("../model/ProductModel");
const bannerModel = require("../model/bannerModel");


let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
  
    auth: {
      user: 'andruce777@gmail.com',
      pass: 'UNtFC0zpY6WGBksy',
    }

});
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

module.exports={

    home:async(req,res,next)=>{
      try {
        
        req.session.logged=true;
        let banner=await bannerModel.findOne({status:true}).limit(1)
        let category= await categoryModel.find().limit(1)
        let row=  await categoryModel.find().skip(1).limit(2)
        let col= await categoryModel.find().skip(3).limit(1)
        let products=await ProductModel.find().limit(8).populate('brand')
        console.log(banner);
        res.render('user/userhome',{ page: 'Home',category,row,col,products,banner})

      } catch (error) {
        next(error)
      }
    },
    // login:(req,res)=>{
    //     res.render('user/login')
    // },
    signup:(req,res)=>{
        res.render('user/signup')
    },
    otpget:(req,res)=>{
        res.render('user/Otppage')
    },
    shop:async(req,res)=>{
       try {
        
        let products=await ProductModel.find().limit(12)
        res.render('user/products',{ page: 'Shop',products})

       } catch (error) {
        next(error)
       }
    },
    productdetials:async(req,res,next)=>{
       try {
        const id=req.params.id;
        const val=req.params.val;
        let prod=await ProductModel.findOne({_id:id}).populate('brand')
        // let products=await ProductModel.aggregate([{$match:{brand:val}},{$limit:4}])
        let products=await ProductModel.find({brand:val}).limit(4)
        res.render('user/productDetiails',{prod,page: 'none',products}) 

       } catch (error) {
        next(error)
       }
    },
    getModal:async(req,res)=>{
        const id=req.body.id;
        let prod=await ProductModel.findOne({_id:id})
        // res.render('user/productDetiails',{prod,page: 'none'})
        res.json(prod)
    },
    // otp:async(req,res,next)=>{
    //     try{
    //         let userName=req.body.name
    //         let Email=req.body.email
    //         let phone=req.body.phonenumber
    //         let password=req.body.password
    //         req.session.email=Email
    //         console.log(req.body);
    //         // userModel.({email:Email})
             
    //         password= await bcrypt.hash(password,10)
    //         console.log(password);
    //         let newUser= new userModel({userName, email:Email,phone:phone,password:password})
    //         newUser.save().then((data)=>{
    //             console.log(data);
    //             const mailoptions={
    //                 from:'andruce777@gmail.com',
    //                 to:req.body.email,
    //                 subject:"OTP for registration is :",
    //                 html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"     
    //             };
    //             transporter.sendMail(mailoptions,(error,info)=>{
    //                 if (error) {
    //                     return console.log(error);
    //                   }
    //                   console.log('Message sent: %s', info.messageId);
    //                   console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    //                   res.render('user/Otppage')
    //             });
    //         }).catch((er)=>{
    //             console.log(er)
    //             console.log("ERROR CATCH");
    //             res.redirect('/signup')
    //         })
    //     }
    //     catch(err){
    //         next(err)
    //     }
    // },
     // ============================OTP============================
  otp: async (req, res,next) => {
    try {
    
       req.session.Name = req.body.name
       req.session.Email = req.body.email;
       req.session.Phone = req.body.phonenumber
       req.session.Password = req.body.password

       Email=req.body.email
        
      const user= await  userModel.findOne({ email: Email });

      if (!user) {
        // send mail with defined transport object
          var mailOptions = {
          from:'andruce777@gmail.com',
          to: req.body.email,
          subject: "Otp for registration is: ",
          html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };
          
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          res.render('user/Otppage');
        });

      }
      else {
        res.redirect('/signup')
      }

    } catch (err) {
      next(err)
    }
  },
    verifyotp:async (req,res,next)=>{
        try{
            console.log(otp);
            if(req.body.otp == otp){
                console.log("SECOND");
                
                req.session.Password=await bcrypt.hash(req.session.Password,10)
                console.log(req.session.Password);
                let newUser= userModel({
                    
                    userName:req.session.Name, 
                    email:req.session.Email,
                    phone:req.session.Phone,
                    password:req.session.Password})

                newUser.save().then(()=>{
                    res.redirect("/")
                })     
            }
            else{
                res.render("user/Otppage");
            }
        } catch(err){
            next(err)
        }    
    },
    resendOTP:(req,res,next)=>{
        try {
            const mailoptions={
                from:'andruce777@gmail.com',
                to:req.body.email,
                subject:"OTP for registration is :",
                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
                
            };
            transporter.sendMail(mailoptions,(error,info)=>{
                if (error) {
                    return console.log(error);
                  }
                  console.log('Message sent: %s', info.messageId);
                  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                  res.render('user/Otppage')
            });
        } catch (err) {
            next(err)
        }
    },

// ++++++++++++++++++++++++++++++SIGNUP USER+++++++++++++++++++++++++++++++++++++++++++

    loginget:(req,res)=>{
        // const user=await userModel.find()
        // res.send("HELLO")
        res.render('user/login',{userSts:'unbanned',userName:"correct"});
    },
    login: async (req,res,next)=>{
        try {
           
            const {email,password}=req.body;
            const user =await userModel.findOne({email:email});
            if(!user){
                return res.render('user/login',{userSts:'unbanned',userName:"incorrect"});
            }
            const isPass = await bcrypt.compare(password,user.password);
            if(!isPass){ 
                return res.render('user/login',{userSts:'unbanned',userName:"incorrect"});

            }
            if(user.status=="banned"){
                return res.render('user/login',{userSts:user.status,userName:"correct"});
            }
            req.session.useremail = req.body.email;
            req.session.userlogged=true;
            console.log("INSIDE LOGIN");
            res.redirect('/')
        }catch (error) {
            next(error)
        }
    },
   
    logout:(req,res)=>{
        req.session.destroy();
        res.redirect('/login');
    }
}
