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
        BRANCH_KEY: JSON.stringify(process.env.BRANCH_KEY),
        GOOGLE_TAG_MANAGER_ID: JSON.stringify(process.env.GOOGLE_TAG_MANAGER_ID),
        MEDIA_DOMAIN: JSON.stringify(process.env.MEDIA_DOMAIN),
        REDDIT: JSON.stringify(process.env.REDDIT),
        STATIC_BASE: JSON.stringify(process.env.STATIC_BASE),
        STATS_URL: JSON.stringify(process.env.STATS_URL),
        TRACKER_CLIENT_NAME: JSON.stringify(process.env.TRACKER_CLIENT_NAME),
        TRACKER_ENDPOINT: JSON.stringify(process.env.TRACKER_ENDPOINT),
        TRACKER_KEY: JSON.stringify(process.env.TRACKER_KEY),
        TRACKER_SECRET: JSON.stringify(process.env.TRACKER_SECRET),
      },
    },
  ]);

  return [ clientConfig, serverConfig ];
};
