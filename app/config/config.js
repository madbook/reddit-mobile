var _ = require('lodash');

module.exports = {
  // web server config
  port: process.env.PERSEPHONE_PORT || 4444,
  environment: process.env.NODE_ENV || 'development',
  cookieSecret: process.env.PERSEPHONE_COOKIE_SECRET || 'snoo',
  env: 'dev',

  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleAnalyticsDomain: process.env.GOOGLE_ANALYTICS_DOMAIN,
};
