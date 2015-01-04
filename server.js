// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

//socket.io listens to an instance of http.Server
var server = require("http").Server(app);
var io = require("socket.io")(server);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

//Enable CORS
var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

        // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    };
};
app.configure(function() {
    // enable CORS!
    app.use(enableCORS);
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//socket 
io.set('origins', 'http://tfe.ngrok.com:8080/socket.io');
io.on('connection', function (socket) {
  socket.emit('establishing connection', { hello: 'world' });
  socket.on('connection established', function (data) {
    console.log(data);
  });
});

// launch ======================================================================
server.listen(port, ip_address, function(){
  console.log("The magic happens on " + ip_address + ", port " + port);
});