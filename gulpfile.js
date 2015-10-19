'use strict';

require('babel/register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
});

var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sequence = require('gulp-sequence').use(gulp);
var util = require('util');


// Check node version
require('./version');

var options = {
  debug: true,
  watch: false,
  paths: {
    build: './build',
    js: 'js',
    css: 'css',
  },
};

gulp.task('load-tasks', function() {
  glob.sync('./buildTasks/*.js').forEach(function(file) {
    try {
      var task = require(file);
      gutil.log(util.format('loading task: %s', file));
      task(gulp, options);
    } catch (e) {
      gutil.log(util.format('unable to require task: %s\n\n%s', file, e));
    }
  });
});

gulp.task('set-watch', function() {
  options.watch = true;
});

gulp.task('set-prod', function() {
  options.debug = false;
});

gulp.task('load-prod', sequence('set-prod', 'load-tasks'));
gulp.task('load-dev', sequence('load-tasks'));
gulp.task('load-watch', sequence('set-watch', 'load-tasks', 'watcher'));
gulp.task('build', sequence('clean', 'assets', ['js', 'less']));

gulp.task('default', sequence('load-prod', 'build'));
gulp.task('dev', sequence('load-dev', 'build'));
gulp.task('watch', sequence('load-watch', 'build'));
gulp.task('icon-fonts', sequence('set-prod', 'load-tasks', 'icons'));

// gulp seems to hang after finishing in some environments
gulp.on('stop', function() {
  if (!options.watch) {
    process.nextTick(function() {
      process.exit(0);
    });
  }
});
