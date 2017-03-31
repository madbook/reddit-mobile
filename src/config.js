/*eslint max-len: 0*/

// This config is shared with the client -- but the client will only see ENV
// variables that are defined in `blueprints.config.js` -- so be sure to have
// sane defaults

import localStorageAvailable from 'lib/localStorageAvailable';


// takes a ';' separated string of key value pairs and turns them into an
// object of { key -> value}
const parseSemiColonKeyValues = (list='') => {
  return list.split(';').reduce((obj, pair) => {
    // check that we have a key value pair with an '=' in the middle.
    // the '=' can't be the first character because there'd be no key
    if (pair && pair.indexOf('=') > 0) {
      const [key, value] = pair.split('=');
      obj[key.trim()] = value.trim();
    }

    return obj;
  }, {});
};

// takes a ';' separated string and returns a list
const parseSemiColonList = (list='') => list.split(';');

const reddit = process.env.REDDIT || 'https://www.reddit.com';

// NOTE: It's very important that this is the root domain and not any
// subdomain. Used for setting cookies, could cause issues like
// losing authentication or infinite redirect loops if it doesn't work.
const redditDomainParts = reddit
  .match(/^https?:\/\/([^\/]+)/)[1]
  .split('.');

// Get the last two parts if the domain has multiple subdmaoins
const rootReddit = redditDomainParts.length < 2
  ? redditDomainParts.join('.')
  : redditDomainParts.splice(redditDomainParts.length - 2, 2).join('.');

const config = () => ({
  https: process.env.HTTPS === 'true',
  httpsProxy: process.env.HTTPS_PROXY === 'true',

  debugLevel: process.env.DEBUG_LEVEL,
  postErrorURL: '/error',

  minifyAssets: process.env.MINIFY_ASSETS === 'true',

  apiHeaders: parseSemiColonKeyValues(process.env.API_HEADERS),
  apiPassThroughHeaders: parseSemiColonList(process.env.API_PASS_THROUGH_HEADERS),

  assetPath: process.env.STATIC_BASE || '',

  origin: process.env.ORIGIN || 'http://localhost:4444',
  port: process.env.PORT || 4444,
  env: process.env.NODE_ENV || 'development',

  nonAuthAPIOrigin: process.env.NON_AUTH_API_ORIGIN || 'https://www.reddit.com',
  authAPIOrigin: process.env.AUTH_API_ORIGIN || 'https://oauth.reddit.com',

  reddit,
  rootReddit,

  amp: process.env.AMP,

  googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID,

  adblockTestClassName: process.env.ADBLOCK_TEST_CLASSNAME || 'ad adsense-ad googad gemini-ad openx',

  localStorageAvailable: localStorageAvailable(),

  statsURL: process.env.STATS_URL || 'https://stats.redditmedia.com/',
  reduxActionLogSize: process.env.REDUX_ACTION_LOG_SIZE || 10,
  mediaDomain: process.env.MEDIA_DOMAIN || 'www.redditmedia.com',
  adsPath: process.env.ADS_PATH || '/api/request_promo.json',
  manifest: {},

  trackerKey: process.env.TRACKER_KEY || 'XXX',
  trackerEndpoint: process.env.TRACKER_ENDPOINT || 'XXX',
  trackerClientSecret: process.env.TRACKER_SECRET || 'XXX',
  trackerClientAppName: process.env.TRACKER_CLIENT_NAME || 'XXX',

  // If statsdHost isn't set, then statsd is skipped
  statsdHost: process.env.STATSD_HOST,
  statsdPort: process.env.STATSD_PORT,
  statsdDebug: process.env.STATSD_DEBUG,
  statsdPrefix: process.env.STATSD_PREFIX || 'mweb2x.staging.server',
  statsdSocketTimeout: process.env.STATSD_TIMEOUT || 100,

  appName: process.env.APP_NAME || 'mweb',

  defaultCountry: process.env.DEFAULT_COUNTRY || 'US',

  // Note that this is a public key, so this can be shared.
  recaptchaSitekey: process.env.RECAPTCHA_SITEKEY || '6LeTnxkTAAAAAN9QEuDZRpn90WwKk_R1TRW_g-JC',

  placeDomain: process.env.PLACE_DOMAIN || 'https://www.reddit.com',
});

export default config();
