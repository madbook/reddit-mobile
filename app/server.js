var http = require('http');
var express = require('express');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var session = require('express-session')
var csurf = require('csurf');

var pageRoutes = require('./routes/pages');
var config = {};

if (process.env.persephone_env === 'production') {
  config = require('./config/prod');
} else {
  config = require('./config/dev');
}

// Start up a new Express instance, and set the config
var app = express();
app.config = config;

// Set the port that the webserver should run on
app.set('port', app.config.port);

// Configure the webserver, and set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(compression());
app.use(cookieParser());
app.use(session({
  secret: config.cookieSecret
  //cookie: { secure: true }
}));

app.use(csurf());

// Set up static directories; if a file isn't found in one directory, it will
// fall back to the next
app.use(express.static(__dirname + '../../build'));
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// Set up the routes
pageRoutes(app);

// Set up the error handler
app.err = require('./error');

// Create a server using http
var server = http.createServer(app);

// Start listening on the configured port
server.listen(app.get('port'));

// server running, display welcome message 
console.info('Welcome to reddit mobile web.');

console.info('Running on port ' + app.get('port') + ' using the '
              + app.config.env + ' environment settings.');

if (app.config.environment === 'development') {
  console.info('Open: http://localhost:' + app.get('port'));
}
