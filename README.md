switcharoo
==========

switcharoo is a web server and build system for building polymorphic
React applications in node or io.js. It is part of a larger series of plugins that,
together, form frontend applications for reddit.

A Brief Overview
----------------
This application provides the core to set up an Express web server and html5
history api, and have these send a request object (containing path, data, etc)
and a callback (a promise interface) to the App.

This application also provides a build system and a base css framework, shared
across plugins.

```
 +---------+          +---------------+
 | express |          | html5 history |
 +---------+          |     api       |
    |                 +---------------+
 req, cb                   req, cb
    |                        |
    \                        /
     ------------------------
                |
                v
            +--------+
            | App.js |
            +--------+
                |
             (router)
                |
                v
            +--------+
            | plugin | -> cb.resolve({ body: reactElement })
            |        | -> cb.reject({ status: 401 })
            +--------+ 
```



The App has an instance of an Express-like request router that it uses to map
requests to the appropriate handling function, and is run on both the client-
and server- side. The React lifecycle can be used to control client-specific
code.

Plugins register themselves via two interfaces:

1. Route handlers that take two paramaters, `req` and `res`. `res` is a promise
  interface that should be called using
  `res.resolve({ body: reactElement, status: 200})` or
  `res.reject({ body: error, status: 400})`. (Body and status are optional in
  both cases, but should generally be added.)
  A complete example of route handling can be seen at
  [switcharoo-plugin-core](https://github.com/reddit/switcharoo-plugin-core).
2. Mutators that modify the rendering of react components. An element query
  syntax is provided, documentation forthcoming.


Getting Up and Running
----------------------

0. Install [node.js](https://nodejs.org/download/) v0.12+ or [io.js](https://iojs.org) v1.8.1+.
1. Make sure that npm's /node_modules/ directory is in your PATH with the variable name NODE_PATH.
2. [Fork](https://github.com/reddit/switcharoo/fork) and clone
  this project.
3. Also fork and clone any plugins you plan on developing. In these, run
  `npm link` to cause the local version of the plugin to be linked to npm.
  You'll also want to `npm link` from within `reddit-mobile` so that plugins
  can resolve circular dependencies.
4. Run `npm install` to install other dependencies. `rm -rf node_modules/<plugin_name>`
  if you are doing local plugin development as well.
5. Run `git submodule update --init` to download this project's submodules
6. Run `npm run build` to build the assets (`npm run watch` to set up a filesystem
   watcher, which will include linked plugins.)
7. Run `npm start` to start the web server. Optionally, create a startup script
  at `start.sh` that sets environment variables and starts the server;
  `start.sh` has been added to the `.gitignore` and will not get checked in.

