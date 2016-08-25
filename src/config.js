/*eslint max-len: 0*/

// This configuration is shared with the client. Any hidden, server-only config
// belongs in ./server instead.

import localStorageAvailable from 'lib/localStorageAvailable';

const config = () => ({
  https: process.env.HTTPS === 'true',
  httpsProxy: process.env.HTTPS_PROXY === 'true',

  debugLevel: process.env.DEBUG_LEVEL,
  postErrorURL: '/error',

  minifyAssets: process.env.MINIFY_ASSETS === 'true',

  assetPath: process.env.STATIC_BASE || '',

  origin: process.env.ORIGIN || 'http://localhost:4444',
  port: process.env.PORT || 4444,
  env: process.env.NODE_ENV || 'development',

  nonAuthAPIOrigin: process.env.NON_AUTH_API_ORIGIN || 'https://www.reddit.com',
  authAPIOrigin: process.env.AUTH_API_ORIGIN || 'https://oauth.reddit.com',

  reddit: process.env.REDDIT || 'https://www.reddit.com',

  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID,

  adblockTestClassName: process.env.ADBLOCK_TEST_CLASSNAME || 'ad adsense-ad googad gemini-ad openx',

  localStorageAvailable: localStorageAvailable(),

  statsURL: process.env.STATS_URL || 'https://stats.redditmedia.com/',
  reduxActionLogSize: process.env.REDUX_ACTION_LOG_SIZE || 50,
  mediaDomain: process.env.MEDIA_DOMAIN || 'www.redditmedia.com',
  adsPath: process.env.ADS_PATH || '/api/request_promo.json',
  manifest: {},

  trackerKey: process.env.TRACKER_KEY,
  trackerEndpoint: process.env.TRACKER_ENDPOINT,
  trackerClientSecret: process.env.TRACKER_SECRET,
  trackerClientAppName: process.env.TRACKER_CLIENT_NAME,

  appName: process.env.APP_NAME || 'mweb',

  defaultCountry: process.env.DEFAULT_COUNTRY || 'US',

  // Note that this is a public key, so this can be shared.
  recaptchaSitekey: process.env.RECAPTCHA_SITEKEY || '6LeTnxkTAAAAAN9QEuDZRpn90WwKk_R1TRW_g-JC',
});

export default config();
