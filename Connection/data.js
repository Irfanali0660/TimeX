let env=require('dotenv');
let mongoose=require('mongoose')

env.config()
mongoose
.connect(process.env.MONGO_URL)
.then(()=>console.log('DBconnection Successfull'))
.catch((err)=>{
    console.log(err);
});

