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

function makeBundleAnalyzer(name, port) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  return new BundleAnalyzerPlugin({
    // Can be `server`, `static` or `disabled`.
    // In `server` mode analyzer will start HTTP server to show bundle report.
    // In `static` mode single HTML file with bundle report will be generated.
    // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
    analyzerMode: 'server',
    // Port that will be used in `server` mode to start HTTP server.
    analyzerPort: port,
    // Path to bundle report file that will be generated in `static` mode.
    // Relative to bundles output directory.
    reportFilename: name + '-report.html',
    // Automatically open report in default browser
    openAnalyzer: true,
    // If `true`, Webpack Stats JSON file will be generated in bundles output directory
    generateStatsFile: true,
    // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
    // Relative to bundles output directory.
    statsFilename: name + '-stats.json',
    // Options for `stats.toJson()` method.
    // For example you can exclude sources of your modules from stats file with `source: false` option.
    // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
    statsOptions: null,
    // Log level. Can be 'info', 'warn', 'error' or 'silent'.
    logLevel: 'info',
  });
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
      },
    }),
  ]);

  if (process.env.ANALYZE_BUILD) {
    clientConfig.webpack.plugins = clientConfig.webpack.plugins.concat([
      makeBundleAnalyzer('client', 4000),
    ]);
  }

  return [ clientConfig, serverConfig ];
};
