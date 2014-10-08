var _ = require('lodash');

module.exports = {
  // web server config
  origin: process.env.ORIGIN || 'http://localhost:4444',
  port: process.env.PORT || 4444,
  env: process.env.NODE_ENV || 'development',
  cookieSecret: process.env.PERSEPHONE_COOKIE_SECRET || 'snoo',

  nonAuthAPIOrigin: process.env.NON_AUTH_API_ORIGIN || 'https://ssl.reddit.com',
  authAPIOrigin: process.env.AUTH_API_ORIGIN || 'https://oauth.reddit.com',

  userAgent: process.env.API_USER_AGENT,

  embedlyKey: process.env.EMBEDLY_KEY,

  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID || '',
    secret: process.env.OAUTH_SECRET || '',
  },

  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleAnalyticsDomain: process.env.GOOGLE_ANALYTICS_DOMAIN,
};
