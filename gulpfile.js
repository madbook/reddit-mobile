'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var livereload = require('gulp-livereload');
var connect = require('connect');

var rename = require('gulp-rename');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var exorcist = require('exorcist');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

/** Config variables */
var serverPort = 8888;
var lrPort = 35731;

/** File paths */
var build = 'build';
var buildjs = 'build/js';

gulp.task('vendor', function () {
  browserify()
    .require('react')
    .bundle()
    .pipe(source('app/client/js/vendor/**/*.js'))
    .pipe(rename('vendor.js'))
    .pipe(gulp.dest(buildjs))
    .pipe(streamify(uglify()))
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest(buildjs));
});

function compileScripts(watch) {
  gutil.log('Starting browserify');

  var entryFile = './app/client/js/app.js';

  var bundler = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true
  });

  bundler.add(entryFile);

  if (watch) {
    bundler = watchify(bundler);
  }

  bundler
    .external('react')
    .transform(reactify);

  var rebundle = function () {
    var stream = bundler.bundle();

    stream.on('error', function (err) { console.error(err.toString()) });

    stream
      .pipe(exorcist(buildjs + '/app.js.map'))
      .pipe(source(entryFile))
      .pipe(rename('app.js'))
      .pipe(gulp.dest(buildjs))
      .pipe(streamify(uglify()))
      .pipe(rename('app.min.js'))
      .pipe(gulp.dest(buildjs));
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

  gulp.watch([build + '/**/*'], reloadPage);
});
