'use strict';

var combiner = require('stream-combiner2');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rev = require('gulp-rev');
var rename = require('gulp-rename');
var buffer = require('gulp-buffer');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var streamqueue = require('streamqueue');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var envify = require('envify/custom');
var exorcist = require('exorcist');
var path = require('path');
var gulpIf = require('gulp-if');
var livereload = require('gulp-livereload');

var notify = require('./utils/notify');

module.exports = function buildJS(gulp, options) {
  gulp.task('js', function(cb) {
    var entryFile = './assets/js/client.es6.js';
    var buildjs = path.join(options.paths.build, options.paths.js);

    var shims = streamqueue({ objectMode: true });
    shims.queue(gulp.src('public/js/es5-shims.js'));
    shims.queue(gulp.src('node_modules/babel/browser-polyfill.js'));

    shims.done()
      .pipe(concat('shims.js'))
      .pipe(gulp.dest(buildjs));

    var bundler = browserify({
      cache: {},
      packageCache: {},
      fullPaths: true,
      debug: options.debug,
      extensions: ['.js', '.es6.js', '.jsx'],
      ignore: [
        'moment',
      ],
    });

    if (options.watch) {
      bundler = watchify(bundler);
    }

    // Add in a few common dependencies so we don't end up browserifying
    // multiple versions in dev, because `npm link` behaves really oddly at
    // times
    bundler
      .require('moment')
      .require('react')
      .require('react-dom')
      .require('superagent');

    bundler.add(entryFile);

    let plugins = [
      'transform-object-rest-spread',
      'transform-async-to-generator',
      'transform-class-properties',
      'syntax-trailing-function-commas',
    ];

    if (!options.debug) {
      plugins = plugins.concat([
        'transform-react-constant-elements',
        'transform-react-inline-elements',
      ]);
    }

    bundler
      .transform(babelify.configure({
        plugins,
        ignore: /.+node_modules\/(moment|q|react|superagent|lodash|snuownd)\/.+/i,
        extensions: ['.js', '.es6.js', '.jsx' ],
        sourceMap: options.debug,
        presets: [
          'es2015',
          'react',
        ],
      }), {
        global: true,
      })
      .transform(envify({
        NODE_ENV: options.debug ? 'development' : 'production',
      }), {
        global: true,
      });

    var bundling = false;

    var rebundle = function() {
      if (bundling) {
        return;
      } else {
        bundling = true;
      }

      notify({
        message: 'Starting js...',
      });

      var stream = bundler.bundle();

      var error = false;
      var combined = combiner.obj([
        stream,
        //exorcist(buildjs + '/client.js.map'),
        source(entryFile),
        rename('client.js'),
        gulp.dest(buildjs),
        gulpIf(!options.debug, streamify(uglify())),
        rename('client.min.js'),
        gulp.dest(buildjs),
        buffer(),
        rev(),
        gulp.dest(buildjs),
        rev.manifest(),
        rename('client-manifest.json'),
        livereload(),
        gulp.dest(buildjs)
          .on('finish', function() {
            if (!error) {
              notify({
                message: 'Finished js',
              });
            }

            if (cb) { cb(); };
            cb = null;
            bundling = false;
            error = false;
          }),
      ]);

      // only catch errors in debug mode,
      // otherwise prod builds won't fail
      //if (options.debug) {
        combined
          .on('error', function(e) {
            error = true;
            notify(e);
          });
      //}
    }

    bundler.on('update', rebundle);
    return rebundle();
  });
};
