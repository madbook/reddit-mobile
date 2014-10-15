require('6to5/register')(/^(?!.*es6\.js$).*\.js$/i);
require('6to5/polyfill');

var http = require('http');
var express = require('express');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var session = require('express-session')
var csurf = require('csurf');
var favicon = require('serve-favicon');

var pageRoutes = require('./routes/pages');
var oauthRoutes = require('./routes/oauth');
var apiRoutes = require('./routes/api');
var config = require('./config');

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
  secret: config.cookieSecret,
  resave: true,
  saveUninitialized: true,
  httpOnly: false,
  cookie: {
    maxAge: 60000
  },
  rolling: true
}));

app.use(csurf());

// Set up static directories; if a file isn't found in one directory, it will
// fall back to the next
app.use(express.static(__dirname + '../../build'));
app.use(express.static(__dirname + '../../public'));
app.use(express.static(__dirname + '../../lib/snooboots/dist'));
app.use(favicon(__dirname + '../../public/favicon.ico'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// Set up api access
var V1Api = require('snoode').v1;
var nonAuthAPI = new V1Api({
  userAgent: config.userAgent,
  origin: config.nonAuthAPIOrigin,
});

var oauthAPI = new V1Api({
  userAgent: config.userAgent,
  origin: config.authAPIOrigin,
});

app.V1Api = function(req){
  if(req.session.token){
    return oauthAPI;
  }

  return nonAuthAPI;
}

// Set up the routes
pageRoutes(app);
oauthRoutes(app);
apiRoutes(app);

// Create a server using http
var server = http.createServer(app);

// Start listening on the configured port
server.listen(app.get('port'));

// server running, display welcome message 
console.info('Welcome to reddit mobile web.');

console.info('Running on port ' + app.get('port') + ' using the '
              + app.config.env + ' environment settings.');

if (app.config.env === 'development') {
  console.info('Open: http://localhost:' + app.get('port'));
}
