var configs = require('@r/build/lib/configs');

module.exports = function(isProduction) {
  var clientConfig = configs.getClientConfig(isProduction);
  var serverConfig = configs.getServerConfig(isProduction);

  // Copy static files for deploying / serving. We also use these in debug
  // to more closely mimic production.
  serverConfig.webpack.plugins = serverConfig.webpack.plugins.concat([{
    generator: 'copy-static-files',
    staticPaths: [
      ['assets/favicon', 'build/favicon'],
      ['assets/fonts', 'build/fonts'],
      ['assets/img', 'build/img'],
    ],
  }]);

  return [ clientConfig, serverConfig ];
};
