var _ = require('lodash');
var defaultConfig = require('./config.js');

module.exports = _.defaults({
  env: process.env.NODE_ENV || "production",
}, defaultConfig);
