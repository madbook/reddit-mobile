// The HTTP server configuration.
// This is the only code (besides gulpfile / index) that is *not* run on the
// client.

import co from 'co';

// server and middleware
import koa from 'koa';
import koaStatic from 'koa-static';
import bodyParser from 'koa-body-parser';
import csrf from 'koa-csrf';
import compress from 'koa-compress';

import { ServerReactApp } from 'horse-react';
import mixin from './app-mixin';

var App = mixin(ServerReactApp);

// Plugins
import plugins from './plugins';

// The core
import oauth from './oauth';

class Server {
  constructor (config) {
    // Intantiate a new App instance (React middleware)
    var app = new App(config);

    var plugin, p;

    if (plugins) {
      for (p in plugins) {
        plugin = plugins[p];
        plugin.register(app);
      }
    }

    oauth(app);

    var server = koa();
    server.keys = config.keys;

    //csrf(server);

    server.use(compress());
    server.use(bodyParser());

    // Set up static routes for built (and unbuilt, static) files
    server.use(koaStatic(__dirname + '/../build'));
    server.use(koaStatic(__dirname + '/../public'));
    server.use(koaStatic(__dirname + '/../lib/snooboots/dist'));

    // Set up oauth routes

    server.use(this.modifyRequest);

    server.use(App.serverRender(app));

    this.server = server;
    this.app = app;
  }

  * modifyRequest (next) {
    this.renderSynchronous = true;
    this.useCache = false;
    yield next;
    //this.useCache = !(this.request.session && this.request.session.token);
    //req.csrf = req.csrfToken();
  }

  start () {
    // Listen to a port and shout it to the world.
    this.server.listen(this.app.config.port);
    console.log('listening on ' + this.app.config.port);
  }
}

export default Server;
