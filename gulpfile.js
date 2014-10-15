'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rev = require('gulp-rev');
var rename = require('gulp-rename');
var buffer = require('gulp-buffer');
var clean = require('gulp-rimraf');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');

var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var to5Browserify = require('6to5-browserify');
var exorcist = require('exorcist');

/** File paths */
var build = './build';
var buildjs = build + '/js';
var buildcss = build + '/css';

gulp.task('less', function() {
  gulp.src(buildcss + '/*.css')
    .pipe(clean({force: true}));

  gulp.src('./app/client/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(buildcss))
    .pipe(minifyCSS())
    .pipe(buffer())
    .pipe(rev())
    .pipe(gulp.dest(buildcss))
    .pipe(rev.manifest())
    .pipe(rename('css-manifest.json'))
    .pipe(gulp.dest(buildcss));
});

gulp.task('vendor', function () {
  gulp.src(buildjs + '/vendor*.js')
    .pipe(clean({force: true}));

  browserify()
    .require('snoode')
    .require('jquery')
    .require('react')
    .require('./lib/snooboots/dist/js/bootstrap.min.js', {
      expose: 'bootstrap',
      depends: {
        'jquery': '$'
      }
    })
    .require('./app/client/js/vendor/jquery.embedly.js', {
      expose: 'embedly',
      depends: {
        'jquery': '$'
      }
    })
    .transform(to5Browserify.configure({
      // Only transform .es6.js files
      ignore: /^(?!.*es6\.js$).*\.js$/i
    }), {
      global: true
    })
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(gulp.dest(buildjs))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(buildjs))
    .pipe(rev.manifest())
    .pipe(rename('vendor-manifest.json'))
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
    .external('jquery')
    .external('bootstrap')
    .external('snoode')
    .transform(to5Browserify.configure({
      // Only transform .es6.js files
      ignore: /^(?!.*es6\.jsx?$).*\.jsx?$/i
    }))
    .transform(reactify);

  var rebundle = function () {
    var stream = bundler.bundle();

    stream.on('error', function (err) { console.error(err.toString()) });

    gulp.src(buildjs + '/app*.js')
      .pipe(clean({force: true}));

    stream
      .pipe(exorcist(buildjs + '/app.js.map'))
      .pipe(source(entryFile))
      .pipe(rename('app.js'))
      .pipe(gulp.dest(buildjs))
      .pipe(streamify(uglify()))
      .pipe(rename('app.min.js'))
      .pipe(buffer())
      .pipe(rev())
      .pipe(gulp.dest(buildjs))
      .pipe(rev.manifest())
      .pipe(rename('app-manifest.json'))
      .pipe(gulp.dest(buildjs));
  }

  bundler.on('update', rebundle);
  return rebundle();
}

/**
 * Run default task
 */

gulp.task('default', ['less', 'vendor'], function() {
  compileScripts(false);
});

gulp.task('watch', ['less', 'vendor'], function() {
  var lrServer = livereload();
  var reloadPage = function (evt) {
    lrServer.changed(evt.path);
  };

  compileScripts(true);

  gulp.watch([build + '/**/*'], reloadPage);
  gulp.watch(['app/client/less/**/*'], ['less']);
});
