// Register that we're using es6, so babel can compile import statements.
// The `ignore` set to false allows babel to compile npm modules, and the `only`
// forces it to only compile files with a `.es6.js` or `.jsx` extension.
require('babel/register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
});

// Require in the express server.
var Server = require('./src/server');

var cluster = require('cluster');
var numCPUs = process.env.PROCESSES || require('os').cpus().length;

// App config
var config = require('./src/config');

// Import built-asset manifests for passing to layouts
var jsManifest = require('./build/js/client-manifest.json');
var cssManifest = require('./build/css/css-manifest.json');
var servers = [];

var failedProcesses = 0;

// Then merge them into a single object for ease of use later
config.manifest = {};
config.processes = numCPUs;

function parseObject (list) {
  if (!list) { return; }
  var obj = {};
  var key;
  var value;
  var split;

  list.split(';').forEach(function (l) {
    if (l && l.indexOf('=')) {
      var split = l.split('=');
      obj[split[0].trim()] = split[1].trim();
    }
  });

  return obj;
}

function parseList (list) {
  if (!list) { return; }
  return list.split(';');
}

config.apiHeaders = parseObject(process.env.API_HEADERS);
config.apiPassThroughHeaders = parseList(process.env.API_PASS_THROUGH_HEADERS);

Object.assign(config.manifest, jsManifest, cssManifest);

function start(config) {
  var server = new Server(config);
  server.start();
  return server;
}

// Private, server-only config that we don't put in config.js, which is shared
config.liveReload = process.env.LIVERELOAD || true;
config.oauth = {
  clientId: process.env.OAUTH_CLIENT_ID || '',
  secret: process.env.OAUTH_SECRET || '',

  secretClientId: process.env.SECRET_OAUTH_CLIENT_ID || '',
  secretSecret: process.env.SECRET_OAUTH_SECRET || '',
};

config.keys = [ process.env.SERVER_SIGNED_COOKIE_KEY || 'lambeosaurus' ];

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  Server.info(config);

  cluster.on('exit', function(worker, code, signal) {
    if (failedProcesses < 20) {
      console.log('Worker ' + worker.process.pid + ' died, restarting.');
      cluster.fork();
      failedProcesses++;
    } else {
      console.log('Workers died too many times, exiting.');
      process.exit();
    }
  });
} else {
  servers.push(start(config));
}
