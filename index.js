// Register that we're using es6, so babel can compile import statements.
// The `ignore` set to false allows babel to compile npm modules, and the `only`
// forces it to only compile files with a `.es6.js` or `.jsx` extension.
require('babel/register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
  stage: 0,
});

var errorLog = require('./src/lib/errorLog');

process.on('uncaughtException', function (err) {
  var url;
  var line;

  if (err.stack) {
    var location = err.stack.split('\n')[1];
    url = location.split(':')[0];
    line = location.split(':')[1];
  }

  if (config) {
    errorLog({
      error: err,
      userAgent: 'SERVER',
      message: err.message,
      line: line,
      url: url,
    }, {
      hivemind: config.statsDomain,
    });
  }

  console.log('Caught exception: ' + err);
  process.exit();
});

// Check node version
require('./version');

// Require in the express server.
var Server = require('./src/server');

var cluster = require('cluster');
var numCPUs = process.env.PROCESSES || require('os').cpus().length;

// App config
var config = require('./src/serverConfig')(numCPUs);

var servers = [];

var failedProcesses = 0;

function start(config) {
  var server = new Server(config);
  server.start();
  return server;
}

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
