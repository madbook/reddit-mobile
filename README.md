switcharoo
==========

A reddit web client. [Discuss on Reddit](https://www.reddit.com/r/theredditswitcharoo)

## :warning: THIS IS A PROTOTYPE
It is not production-ready, or even review-ready, and may be
dangerous to run until this statement disappears. It is a
prototype of how new technologies may build a new reddit web client.
It is not meant to be a complete replacement, or even a good example
of code, until this statement disappears.

It is not documented well or stable. It *will be*. Just not right now.


Technologies
------------

* Node.js (0.11+)
* React, server- and client- side
* ES6
* LESS (a bootstrap fork)

How to Run
----------

* Dependencies: node 0.11+
* Find a nice home, and `git clone` it in
* `cd` to the new folder
* `git submodule init`
* `git submodule update`
* `npm install`
* Run `npm run watch` to kick off a live-reloading build
  (or just run `./node_modules/gulp/bin/gulp build` to build without watching)
* Run `npm start` to kick off the web server
* Visit `localhost:4444`

MIT licensed.
