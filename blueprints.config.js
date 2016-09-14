var configs = require('@r/build/lib/configs');

module.exports = function(isProduction) {
  var clientConfig = configs.getClientConfig(isProduction);
  var serverConfig = configs.getServerConfig(isProduction);

  // Copy static files for deploying / serving. We also use these in debug
  // to more closely mimic production.
  serverConfig.webpack.plugins = serverConfig.webpack.plugins.concat([
    {
      generator: 'copy-static-files',
      staticPaths: [
        ['assets/favicon', 'build/favicon'],
        ['assets/fonts', 'build/fonts'],
        ['assets/img', 'build/img'],
      ],
    },
  ]);

  clientConfig.webpack.plugins = clientConfig.webpack.plugins.concat([
    {
      generator: 'set-node-env',
      'process.env': {
        TRACKER_KEY: JSON.stringify(process.env.TRACKER_KEY || 'XXX'),
        TRACKER_ENDPOINT: JSON.stringify(process.env.TRACKER_ENDPOINT || 'XXX'),
        TRACKER_SECRET: JSON.stringify(process.env.TRACKER_SECRET || 'XXX'),
        TRACKER_CLIENT_NAME: JSON.stringify(process.env.TRACKER_CLIENT_NAME || 'XXX'),
        REDDIT: JSON.stringify(process.env.REDDIT),
      },
    },
  ]);

  return [ clientConfig, serverConfig ];
};
