'use strict';

var consolidate = require('gulp-consolidate');
var del = require('del');
var iconfont = require('gulp-iconfont');
var rename = require('gulp-rename');

var config = require('./../src/config.es6.js');

module.exports = function(gulp, options) {
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
      .on('glyphs', function(glyphs, options) {
        for (var i = 0, iLen = glyphs.length; i<iLen; i++) {
            var item = glyphs[i];
            item.codePoint = item.unicode[0].charCodeAt(0).toString(16).toUpperCase();
            item.fileName = item.name;
          }

        gulp.src('node_modules/gulp-iconfont-css/templates/_icons.less')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontPath: assetPath,
            fontName: 'icons-' + r,
            className: 's'
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
};
