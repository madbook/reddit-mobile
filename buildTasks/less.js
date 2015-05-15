// take less file
// watch and rebuild it

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var rename = require('gulp-rename');
var buffer = require('gulp-buffer');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var config = require("../src/config");

module.exports = function buildLess(gulp, buildcss, watch) {
  return function (cb) {
    gulp.src('./assets/less/*.less')
      .pipe(less({
        globalVars: {
          assetPath: config.assetPath,
        }
      }))
      .pipe(gulp.dest(buildcss))
      .pipe(minifyCSS())
      .pipe(buffer())
      .pipe(rev())
      .pipe(gulp.dest(buildcss))
      .pipe(rev.manifest())
      .pipe(rename('css-manifest.json'))
      .pipe(gulp.dest(buildcss));

    cb();
  }
}
