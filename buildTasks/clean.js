'use strict';

var del = require('del');
var path = require('path');

module.exports = function(gulp, options) {
  gulp.task('clean', function(cb) {
    del([
      path.join(options.paths.build, '**'),
    ], cb);
  });
};
