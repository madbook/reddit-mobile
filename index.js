'use strict';

let dashboard;
// log up as high as possible, even though it's kind of ugly, because
// otherwise you get lots of artifacts in your dashboard (if enabled)
let oldlog = global.console.log;
let oldinfo = global.console.info;
let olderror = global.console.error;
let oldwarn = global.console.warn;

// If we created a server dashboard (using --dashboard), log to its log
// instead of using console.log, to stdout. Override it globally (gasp)
// here.
global.console.log = global.console.info = function() {
  if (dashboard) {
    dashboard.log.apply(dashboard, arguments);
  } else {
    oldlog.apply(this, arguments);
  }
}

global.console.error = function() {
  if (dashboard) {
    dashboard.error.apply(dashboard, arguments);
  } else {
    olderror.apply(this, arguments);
  }
}

global.console.warn = function() {
  if (dashboard) {
    dashboard.warn.apply(dashboard, arguments);
  } else {
    olderror.apply(this, arguments);
  }
}

// Register that we're using es6, so babel can compile import statements.
// The `ignore` set to false allows babel to compile npm modules, and the `only`
// forces it to only compile files with a `.es6.js` or `.jsx` extension.
require('babel-register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
  presets: [
    'es2015',
    'react',
  ],
  plugins: [
    'transform-object-rest-spread',
    'transform-async-to-generator',
    'transform-class-properties',
    'syntax-trailing-function-commas',
    'transform-react-constant-elements',
    'transform-react-inline-elements',
  ],
});

const throttle = require('lodash/function/throttle');

const numCPUs = process.env.PROCESSES || require('os').cpus().length;

// App config
const config = require('./src/server/config').default(numCPUs);

const errorLog = require('./src/lib/errorLog').default;

// If we miss catching an exception, format and log it before exiting the
// process.
process.on('uncaughtException', function (err) {
  console.log('Caught exception', err, err.stack);

  let url;
  let line;

  if (err.stack) {
    let location = err.stack.split('\n')[1];
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
      hivemind: config.statsURL,
    });
  }

  process.exit();
});

// Check node version
require('./version');

// Require in the express server.
const Server = require('./src/server').default;
let Console;

const cluster = require('cluster');

let failedProcesses = 0;

function start(config) {
  let server = new Server(config);
  server.start();
  return server;
}

if (cluster.isMaster) {
  // Use `silent` so that child processes write to the master process's stdout
  // instead of writing directly to stdout. This way, if we fired up a dashboard,
  // we can write to the dashboard's logger instead.
  cluster.setupMaster({
    silent: true
  });

  const StatsdClient = require('statsd-client');

  const statsd = new StatsdClient(config.statsd || {
    _socket:  { send: ()=>{}, close: ()=>{}  }
  });

  let processes = [];

  // If we used `node index.js --console`, instantiate a dashboard.
  if (process.argv[2] && process.argv[2] === '--console') {
    Console = require('./src/server/console').default;
    dashboard = new Console(config);
    dashboard.start();
  }

  // Write to either dashboard or stdout.
  function stdout (data) {
    if (dashboard) {
      dashboard.log(data);
    } else {
      process.stdout.write(data);
    }
  }

  // Write to either dashboard or stdout.
  function stderr (data) {
    if (dashboard) {
      dashboard.error(data);
    } else {
      process.stderr.write(data);
    }
  }

  for (let i = 0; i < numCPUs; i++) {
    let fork = cluster.fork();

    // Set the stdout to the above functions so that we write to the right
    // place.
    fork.process.stdout.on('data', stdout);
    fork.process.stderr.on('data', stderr);

    processes.push(fork.process.pid);
  }

  // Send the process info to the dashboard so it can monitor CPU / Memory usage.
  if (dashboard) {
    dashboard.setProcesses(processes);
  }

  console.log(`listening on ${config.port} on ${config.processes} processes (pids: master: ${process.pid}, workers: ${processes.join(',')}).`);

  if (config.keys.length === 1 && config.keys[0] === 'lambeosaurus') {
    console.warn('WARNING: Using default security keys.');
  }

  let activeRequests = {};

  let sendRequests = throttle(function(requests) {
    if (requests) {
      statsd.increment('activeRequests', requests);
    }
  }, 10000);

  // To communicate between worker threads and the master thread, specifically
  // for the dashboard, we have to send messages; so we bind to `Server` events
  // below, and fire them through the process to here. The dashboard, if running,
  // can then do things with the data sent in.
  cluster.on('message', function(message) {
    if (message.type) {
      switch (message.type) {
        case 'log:request':
          if (dashboard) {
            return dashboard.logRequest(message.args);
          }

          console.log(message.args[0], message.args[1], message.args[2]);
          break;

        case 'log:activeRequests':
          if (!activeRequests[message.pid]) {
            activeRequests[message.pid] = [];
          }

          activeRequests[message.pid].push(message.requests);

          if (activeRequests[message.pid].length > 40) {
            activeRequests[message.pid] = activeRequests[message.pid].slice(-40);
          }

          let latestTotal = 0;

          for (let a in activeRequests) {
            latestTotal += activeRequests[a][activeRequests[a].length - 1];
          }

          sendRequests(latestTotal);

          if (dashboard) {
            dashboard.updateActiveRequests(activeRequests);
          }

          break;
      }
    }
  });

  // If a worker dies, log it!
  cluster.on('exit', function(worker, code, signal) {
    if (failedProcesses < 20) {
      console.log('Worker ' + worker.process.pid + ' died, restarting.');

      let fork = cluster.fork();

      fork.process.stdout.on('data', stdout);
      fork.process.stderr.on('data', stderr);

      failedProcesses++;

      if (dashboard) {
        dashboard.failProcess(worker.process.pid);
        dashboard.addProcess(fork.process.pid);
      }
    } else {
      console.log('Workers died too many times, exiting.');
      process.exit();
    }
  });
} else {
  // If we're not a master process, create a server that can listen for http
  // requests. Also bind some events to worker messages that can then be
  // logged.
  let server = start(config);

  server.app.on('log:request', function() {
    process.send({
      type: 'log:request',
      args: Array.prototype.slice.call(arguments)
    });
  });

  server.app.on('log:activeRequests', function(requests) {
    process.send({
      type: 'log:activeRequests',
      requests: requests,
      pid: process.pid,
    });
  });
}
