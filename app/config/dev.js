var _ = require('lodash');
var defaultConfig = require('./config.js');

module.exports = _.defaults({
  liveReload: true,
  env: 'dev',
}, defaultConfig);
