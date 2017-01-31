var child_process = require('child_process');
var configs = require('@r/build/lib/configs');
var webpack = require('webpack');

function generateReleaseVersion() {
  try {
    return child_process
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim();
  } catch (e) {
    return Math.random().toString(36).slice(2);
  }
}

module.exports = function(isProduction) {
  var release = generateReleaseVersion();
  var options = {
    sentryProject: 'mobile-web',
    sentryOrg: 'sentry',
    release: release,
  };
  var clientConfig = configs.getClientConfig(isProduction, options);
  var serverConfig = configs.getServerConfig(isProduction, options);

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
    new webpack.DefinePlugin({
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
        SENTRY_CLIENT_PUBLIC_URL: JSON.stringify(process.env.SENTRY_CLIENT_PUBLIC_URL),
        ENV: JSON.stringify('client'),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }
    }),
  ]);

  return [ clientConfig, serverConfig ];
};
