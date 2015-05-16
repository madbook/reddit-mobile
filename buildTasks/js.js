// take js file
// watch and rebuild it

var gulp = require('gulp');
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
var exorcist = require('exorcist');

var gulpIf = require('gulp-if');

module.exports = function buildJS(gulp, buildjs, watch, prod) {
  return function(cb) {
    var entryFile = './assets/js/client.es6.js';

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
      debug: !prod,
      extensions: ['.js', '.es6.js', '.jsx'],
      ignore: [
        'q',
        'moment',
      ],
    });

    if (watch) {
      bundler = watchify(bundler);
    }

    // Add in a few common dependencies so we don't end up browserifying
    // multiple versions in dev, because `npm link` behaves really oddly at
    // times
    bundler
      .require('moment')
      .require('q')
      .require('react')
      .require('reddit-text-js')
      .require('superagent');

    bundler.add(entryFile);

    bundler
      .transform(babelify.configure({
        ignore: /.+node_modules\/(moment|q|react|reddit-text-js|superagent|gsap)\/.+/i,
        extensions: ['.js', '.es6.js', '.jsx' ],
        sourceMap: !prod,
      }), {
        global: true,
      });

    var bundling = false;

    var rebundle = function () {
      if(bundling) {
        return;
      } else {
        bundling = true;
      }

      gutil.log('Starting bundle...');

      var stream = bundler.bundle();

      stream
        .pipe(exorcist(buildjs + '/client.js.map'))
        .pipe(source(entryFile))
        .pipe(rename('client.js'))
        .pipe(gulp.dest(buildjs))
        .pipe(gulpIf(prod, streamify(uglify())))
        .pipe(rename('client.min.js'))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulp.dest(buildjs))
        .pipe(rev.manifest())
        .pipe(rename('client-manifest.json'))
        .pipe(gulp.dest(buildjs))
        .on('finish', function() {
          if(cb) { cb(); };
          cb = null;
          bundling = false;

          gutil.log('Finished bundle.');
        })
        .on('error', function (err) {
          console.error(err.toString());
        });
    }

    bundler.on('update', rebundle);
    return rebundle();
  }
}
