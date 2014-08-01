var _ = require('lodash');
var defaultConfig = require('./config.js');

module.exports = _.defaults({
  environment: process.env.NODE_ENV || "production",
}, defaultConfig);
