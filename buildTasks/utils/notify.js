'use strict';

var gutil = require('gulp-util');
var notifier = require('node-notifier');
var path = require('path');
var util = require('util');
var _ = require('lodash');

module.exports = function(error, options) {
  var isError = error instanceof Error;
  var color = isError ? 'red' : 'green';

  if (isError) {
    options = _.defaults({}, options, {
      title: 'Gulp error',
      message: error.message,
    });
  } else {
    options = error;
  }

  options = _.defaults({}, options, {
    title: 'Gulp notification',
    sound: false,
    icon: isError ?
      path.join(__dirname, '../assets/gulp-error.png') :
      path.join(__dirname, '../assets/gulp.png'),
  });

  gutil.log(
    gutil.colors[color](util.format('[%s]', options.title)), options.message);

  notifier.notify(options);
};