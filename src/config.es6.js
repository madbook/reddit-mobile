// This configuration is shared with the client. Any hidden, server-only config
// belongs in ./server instead.

function config() {
  return {
    https: process.env.HTTPS === 'true',
    httpsProxy: process.env.HTTPS_PROXY === 'true',

    debugLevel: process.env.DEBUG_LEVEL === 'true',

    minifyAssets: process.env.MINIFY_ASSETS === 'true',

    assetPath: process.env.STATIC_BASE || '',

    origin: process.env.ORIGIN || 'http://localhost:4444',
    port: process.env.PORT || 4444,
    env: process.env.NODE_ENV || 'development',

    nonAuthAPIOrigin: process.env.NON_AUTH_API_ORIGIN || 'https://www.reddit.com',
    authAPIOrigin: process.env.AUTH_API_ORIGIN || 'https://oauth.reddit.com',

    reddit: process.env.REDDIT || 'https://www.reddit.com',

    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,

    loginPath: process.env.LOGIN_PATH || '/oauth2/login',

    statsDomain: process.env.STATS_DOMAIN || 'https://stats.redditmedia.com/',
    adsPath: process.env.ADS_PATH ||  '/api/request_promo.json',
    manifest: {},

    trackerKey: process.env.TRACKER_KEY,
    trackerEndpoint: process.env.TRACKER_ENDPOINT,
    trackerClientName: process.env.TRACKER_CLIENT_NAME
  };
};

export default config;
