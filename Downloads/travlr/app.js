var createError = require('http-errors');
var express = require('express');
const exphbs = require('express-handlebars');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var travelRouter = require('./app_server/routes/travel');
var apiRouter = require('./app_api/routes/index');

// Wire in our authentication module 
var passport = require('passport'); 
require('./app_api/config/passport'); 

const { handlebars } = require('hbs');

require('dotenv').config();


var app = express();




//Enable CORS globally
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Bring in the database
require ('./app_api/models/db');

// Set up Handlebars engine with partials
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs', // File extension for Handlebars templates
    defaultLayout: 'layout', // Specify the default layout file
    layoutsDir: path.join(__dirname, 'app_server', 'views', 'layouts'), // Path to layouts
    partialsDir: path.join(__dirname, 'app_server', 'views', 'partials'), // Path to partials
  })
);


// view engine setup

app.set('views', path.join(__dirname, 'app_server', 'views'));

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(passport.initialize());

// Catch unauthorized error and create 401 
app.use((err, req, res, next) => { 
  if(err.name === 'UnauthorizedError') { 
  res 
  .status(401) 
  .json({"message": err.name + ": " + err.message}); 
  } 
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;