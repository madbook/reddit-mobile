var http = require('http');
var connect = require('connect');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');

var pages = require('./routes/pages');
var config = {};

if (process.env.persephone_env === 'production') {
  config = require('./config/dev');
} else {
  config = require('./config/prod');
}


// Start up a new Express instance, and set the config
var app = express();
app.config = config;

// Set the port that the webserver should run on
app.set('port', app.config.port);

// Configure the webserver, and set up middleware
app.use(bodyParser());
app.use(compression());

// Set up static directories; if a file isn't found in one directory, it will
// fall back to the next
app.use(express.static(__dirname + '../build'));
app.use(express.static(__dirname + '/public'));

// ./routes.js contains all of the routes that the webserver should parse
pages(app);

// Require in error handler
app.err = require('./error');

// Create a server using http,
var server = http.createServer(app);

// Start listening on the configured port
server.listen(app.get('port'));

// server running, display welcome message 
console.info('Welcome to reddit mobile web.');

console.info('Running on port ' + app.get('port') + ' using the '
              + app.config.environment + ' environment settings.');

if (app.config.environment === 'development') {
  console.info('Open: http://localhost:' + app.get('port'));
}
