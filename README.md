reddit-mobile
=============

reddit-mobile is a web server and build system for building polymorphic
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
  [routes.jsx](./src/routes.jsx).
2. Mutators that modify the rendering of react components. An element query
  syntax is provided, documentation forthcoming.


Getting Up and Running
----------------------

0. Install [node.js](https://nodejs.org/download/) v4.1+ or iojs 3.0+
1. [Fork](https://github.com/reddit/reddit-mobile/fork) and clone
  this project.
2. Run `npm install` to install other dependencies.
3. Run `git submodule update --init` to download this project's submodules.
4. Run `npm run build` to build the assets (`npm run watch` to set up a filesystem
   watcher.)
5. Register a new [oauth application](https://www.reddit.com/prefs/apps/) and set up your [environment variables](./CONFIG.md)
6. Run `npm start` to start the web server. Optionally, create a startup script
  at `start.sh` that sets environment variables and starts the server;
  `start.sh` has been added to the `.gitignore` and will not get checked in.

