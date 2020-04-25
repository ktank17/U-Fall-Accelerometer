//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
//Use express-session for maintaining sessions
const session = require('express-session');
const http = require('http');

const scheduler = require('./scheduler');
const {check, validationResult} = require('express-validator');
var cookieParser = require('cookie-parser');

const app = express();

//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


//initialize sessions
app.use(session({
    key: 'patient_id',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 60000000
    }
}));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
 app.use((req, res, next) => {
   console.log('--inside middleware--');
   console.log('cookie : '+ req.cookies.user_sid);
   console.log('session : '+ req.session.user);
   if (req.cookies.user_sid && !req.session.user) {
     res.clearCookie('user_sid');
   }
   next();
 });

// // middleware function to check for logged-in users
 var sessionChecker = (req, res, next) => {
   console.log('--inside middleware session checker--');
   console.log('cookie : '+ req.cookies.user_sid);
   console.log('session : '+ req.session.user);
   if (req.session.user && req.cookies.user_sid) {
     console.log('req.session.user :', req.session.user);
    res.redirect('/index');
   } else {
     next();
   }
 };
//
//
// // route for Home-Page
 app.get('/', sessionChecker, (req, res) => {
   console.log('--inside route for home page function--');
   res.redirect('/index');
 });

//set public folder as static folder for static file
//app.use('/assets',express.static(__dirname + '/public'));
app.use(express.static('./views'));
app.use(express.static('public'));

//create connection to main
const main = require('./routes/main.js')
app.use(main);

const user = require('./routes/users.js')
app.use(user);

scheduler.start();

//create connection to user
//const user = require('./routes/users.js')
//app.use(user);

app.listen(80, () => {
    console.log("Server is up and listening on 80...")
})
