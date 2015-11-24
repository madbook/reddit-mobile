reddit-mobile
=============

reddit-mobile is a web server and build system for building polymorphic
React applications in node or io.js. It is part of a larger series of plugins that,
together, form frontend applications for reddit.

See [the wiki](https://github.com/reddit/reddit-mobile/wiki) for an in-depth
explanation of how everything fits together.

Getting Up and Running
----------------------

0. Install [node.js](https://nodejs.org/download/) v4.1+ or iojs 3.0+
1. [Fork](https://github.com/reddit/reddit-mobile/fork) and clone
  this project.
2. Run `npm install` to install other dependencies.
3. Run `git submodule update --init` to download this project's submodules.
4. Run `npm run build` to build the assets (`npm run watch` to set up a filesystem watcher.)
5. Register a new [oauth application](https://www.reddit.com/prefs/apps/) and
  set up your [environment variables](./CONFIG.md). Redirect URI should be
  `http://localhost:4444/oauth2/token`.
6. Run `npm start` to start the web server. Optionally, create a startup script
  at `start.sh` that sets environment variables and starts the server;
  `start.sh` has been added to the `.gitignore` and will not get checked in.
7. If you need to work on dependencies (snoode, horse-react, etc):
    1. Delete the dependencies you installed from ./node_modules
    2. Fork and clone the dependencies somewhere
    3. Run `npm link` within the dependency that you cloned
    4. Repeat recursively if you need to work on a dependency's dependency
    5. Re-run the build and restart your server (`npm run watch` *will* watch
      linked files)
8. Commit hooks - symlink `hooks` into `.git/hooks` (`ln -s -f ../hooks .git/hooks`), which
  will run some safety checks before committing and pushing code.

