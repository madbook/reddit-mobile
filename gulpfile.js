'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var livereload = require('gulp-livereload');
var connect = require('connect');

var rename = require('gulp-rename');
var browserify = require('browserify');
var watchify = require('watchify');
var es6ify = require('es6ify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var exorcist = require('exorcist');

/** Config variables */
var serverPort = 8888;
var lrPort = 35731;


/** File paths */
var build = 'build';

var htmlFiles = 'app/**/*.html';
var jsxFiles = 'app/jsx/**/*.jsx';

gulp.task('vendor', function () {
  return browserify()
    .require('react')
    .require('traceur-runtime')
    .bundle()
    .pipe(source('app/js/vendor/**/*.js'))
    .pipe(rename('vendor.js'))
    .pipe(gulp.dest(build + '/js'));
});


gulp.task('html', function () {
  return gulp.src(htmlFiles).
    pipe(gulp.dest(build));
});

function compileScripts(watch) {
  gutil.log('Starting browserify');

  var entryFile = './app/jsx/app.jsx';
  es6ify.traceurOverrides = { experimental: true };

  var bundler;
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true
  });

  b.add(entryFile);

  if (watch) {
    bundler = watchify(b);
  } else {
    bundler = b;
  }

  bundler
    .external('react')
    .external('traceur-runtime')
    .transform(reactify)
    .transform(es6ify.configure(/.jsx/));

  var rebundle = function () {
    var stream = bundler.bundle();

    stream.on('error', function (err) { console.error(err) });

    stream
      .pipe(exorcist(build + '/js/app.js.map'))
      .pipe(source(entryFile))
      .pipe(rename('app.js'))
      .pipe(gulp.dest(build + '/js' ));
  }

  bundler.on('update', rebundle);
  return rebundle();
}

function initWatch(files, task) {
  if (typeof task === "string") {
    gulp.start(task);
    gulp.watch(files, [task]);
  } else {
    task.map(function (t) { gulp.start(t) });
    gulp.watch(files, task);
  }
}

/**
 * Run default task
 */
gulp.task('default', ['vendor'], function () {
  var lrServer = livereload(lrPort);
  var reloadPage = function (evt) {
    lrServer.changed(evt.path);
  };

  function initWatch(files, task) {
    gulp.start(task);
    gulp.watch(files, [task]);
  }

  compileScripts(true);
  initWatch(htmlFiles, 'html');

  gulp.watch([build + '/**/*'], reloadPage);
});
