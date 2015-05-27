'use strict';

module.exports = function(gulp, options) {
  gulp.task('assets', function(cb) {
    gulp.src('./public/**/*')
      .pipe(gulp.dest('./build/'));

    gulp.src('./assets/fonts/*')
      .pipe(gulp.dest('./build/fonts/'));

    gulp.src('./lib/snooboots/dist/fonts/*')
      .pipe(gulp.dest('./build/fonts'));

    cb();
  });
};
