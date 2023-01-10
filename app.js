const createError = require('http-errors');
const express = require('express');
const path =require('path');
const logger =require('morgan');
const cookieParser = require('cookie-parser');
const session =require('express-session');
// const expressLayout = require('express-ejs-layouts');

const db= require('./Connection/data');

const adminRouter= require('./Routers/adminRouter');
const userRouter = require('./Routers/userRouter')

const app = express();

app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({secret:"Hope",cookie:{maxAge:6000000000}}));
console.log(__dirname)

app.use('/',adminRouter);
app.use('/',userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error/error');
  });
  
  
  // module.exports = app;
  
  app.listen(7000, () => {
    console.log("TIMEZONE server started on PORT 7000");
  })
