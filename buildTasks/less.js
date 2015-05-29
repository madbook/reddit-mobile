'use strict';

var combiner = require('stream-combiner2');
var rev = require('gulp-rev');
var rename = require('gulp-rename');
var buffer = require('gulp-buffer');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var livereload = require('gulp-livereload');

var notify = require('./utils/notify');

module.exports = function buildLess(gulp, options) {
  var buildcss = path.join(options.paths.build, options.paths.css);

  gulp.task('less', function (cb) {
    notify({
      message: 'Starting less...',
    });

    var error = false;
    var combined = combiner.obj([
      gulp.src('./assets/less/base.less'),
      less(),
      gulp.dest(buildcss),
      minifyCSS(),
      buffer(),
      rev(),
      gulp.dest(buildcss),
      rev.manifest(),
      rename('css-manifest.json'),
      livereload(),
      gulp.dest(buildcss)
        .on('finish', function() {
          if (!error) {
            notify({
              message: 'Finished less',
            });
          }
        }),
    ]);

    // only catch errors in debug mode,
    // otherwise prod builds won't fail
    if (options.debug) {
      combined
        .on('error', function(e) {
          error = true;
          notify(e);
        });
    }

    cb();
  });
};
