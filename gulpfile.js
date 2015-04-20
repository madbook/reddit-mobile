'use strict';

require('babel/register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
});

/** File paths */
var build = './build';
var buildjs = build + '/js';
var buildcss = build + '/css';

var gulp = require('gulp');
var livereload = require('gulp-livereload');
var del = require('del');
var sequence = require('gulp-sequence');

var config = require('./src/config.es6.js');

var buildJS = require('./buildTasks/js');
var buildLess = require('./buildTasks/less');

var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

var rename = require('gulp-rename');

gulp.task('icons', function(cb) {
  var r = Math.random();
  var assetPath = (config.assetPath || '..') + '/fonts/';

  del([
    'assets/fonts/**',
  ], function() {
    gulp.src(['assets/icons/*.svg'])
      .pipe(iconfont({
        fontName: 'icons', // required
        appendCodepoints: false,
        normalize: true,
        fontHeight: 1000,
    }))
      .on('codepoints', function(codepoints, options) {
        for (var i = 0, iLen = codepoints.length; i<iLen; i++) {
          var item = codepoints[i];
          item.codePoint = item.codepoint.toString(16);
          item.fileName = item.name;
        }
        gulp.src('node_modules/gulp-iconfont-css/templates/_icons.less')
          .pipe(consolidate('lodash', {
            glyphs: codepoints,
            fontName: 'icons-' + r,
            fontPath: assetPath,
            className: 's',
          }))
          .pipe(gulp.dest('assets/less'));
      })
      .pipe(rename({
        suffix: '-' + r,
      }))
      .pipe(gulp.dest('assets/fonts/'))
      .on('finish', function() {
        cb();
      });
  });
});

gulp.task('less', buildLess(gulp, buildcss));
gulp.task('js', buildJS(gulp, buildjs));

gulp.task('prod-less', buildLess(gulp, buildcss, false, true));
gulp.task('prod-js', buildJS(gulp, buildjs, false, true));

gulp.task('watchless', buildLess(gulp, buildcss, true));
gulp.task('watchjs', buildJS(gulp, buildjs, true));

gulp.task('clean', function(cb) {
  del([
    'build/**',
  ], cb);
});

gulp.task('assets', function(cb) {
  gulp.src('./public/**/*')
    .pipe(gulp.dest('./build/'));

  gulp.src('./assets/fonts/*')
    .pipe(gulp.dest('./build/fonts/'));

  gulp.src('./lib/snooboots/dist/fonts/*')
    .pipe(gulp.dest('./build/fonts'));

  cb();
});

gulp.task('live', function(cb) {
  var lrServer = livereload();
  var reloadPage = function(evt) {
    lrServer.changed(evt.path);
  };

  gulp.watch([build + '/**/*'], reloadPage);
});

gulp.task('default', sequence('clean', 'assets', ['prod-js', 'prod-less']));
gulp.task('dev', sequence('clean', 'assets', ['js', 'less']));
gulp.task('watch', sequence('watchless', 'watchjs'));
