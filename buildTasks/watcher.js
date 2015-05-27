'use strict';

var livereload = require('gulp-livereload');
var path = require('path');

module.exports = function(gulp, options) {
  gulp.task('watcher', function(cb) {
    if (!options.watch) {
      return;
    }

    livereload.listen();
    gulp.watch('./assets/less/**/*.less', ['less']);

    cb();
  });
};
