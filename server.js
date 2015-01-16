// server.js

// get all the tools we need
var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var passport = require('passport');// used for auth
var flash    = require('connect-flash');
//if server is running on openshift server, fetch its port, else use port 80
var port = process.env.OPENSHIFT_NODEJS_PORT || 80; 
//if server is running on openshift server, fetch its ipaddress, else use localhost
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var morgan       = require('morgan'); //used to provide log
var cookieParser = require('cookie-parser'); //used to parse cookies
var bodyParser   = require('body-parser'); //used to parse body in middleware
var session      = require('express-session'); // used to manage sessions

//get db configuration
var configDB = require('./config/database.js'); 

//socket.io listens to an instance of http.Server
var server = require("http").Server(app);
var io = require("socket.io")(server);

// configuration 
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // get information from html forms
//allow to cross origin requests for sockets
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	return next();
});
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovemytfesomuch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes 
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// start server
server.listen(port, ip_address, function(){
  console.log("The magic happens on " + ip_address + ", port " + port);
});