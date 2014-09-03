var _ = require('lodash');

module.exports = {
  // web server config
  origin: 'http://localhost:4444',
  port: process.env.PORT || 4444,
  environment: process.env.NODE_ENV || 'development',
  cookieSecret: process.env.PERSEPHONE_COOKIE_SECRET || 'snoo',
  env: 'dev',

  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID || '',
    secret: process.env.OAUTH_SECRET || '',
  },

  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleAnalyticsDomain: process.env.GOOGLE_ANALYTICS_DOMAIN,
};
