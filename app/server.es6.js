import * as http from 'http';
import * as express from 'express';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as session from 'express-session';
import * as csurf from 'csurf';
import * as favicon from 'serve-favicon';

import { v1 as V1Api } from 'snoode';

import pageRoutes from './routes/pages';
import oauthRoutes from './routes/oauth';
import apiRoutes from './routes/api';
import config from './config';

import { transform as es6transform } from '6to5';

var wrappedTransform = (source) => {
  var src = es6transform(source, {
    sourcemaps: true,
    blacklist: ['jsx', 'react']
  });

  return src.code;
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
app.engine('jsx', require('express-react-views').createEngine({
  jsx: {
    harmony: true,
    additionalTransform: wrappedTransform,
  },
}));

// Set up api access
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
