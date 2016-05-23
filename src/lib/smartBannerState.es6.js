import moment from 'moment';
import localStorageAvailable from './localStorageAvailable';
import constants from '../constants';

const BASE_VAL = {
  show: false,
  impressionUrl: '',
  clickUrl: '',
};

const TIME_LIMIT = 2;
const TIME_INTERVAL = 'weeks';

const ALLOWED_PAGES = new Set([
  'index',
  'index.subreddit',
  'comments.subreddit',
]);

const IOS_USER_AGENTS = [
  'iPhone',
  'iPod',
];

const ANDROID_USER_AGENTS = [
  'Android',
];

const ALLOWED_DEVICES = IOS_USER_AGENTS.concat(ANDROID_USER_AGENTS);

const DISALLOWED_COUNTRIES = new Set(['BR', 'CU', 'DE', 'FR', 'ID', 'IR', 'MM', 'SD']);

const PAGE_PERCENTAGES = {
  'comments.subreddit': 5,
};

const USE_TUNE = 100;

const checkDeviceType = (allowedAgents, userAgentString) => {
  return allowedAgents.some(a => userAgentString.indexOf(a) > -1);
};

export function shouldShowBanner({ actionName, loid, country, data, userAgent }={}) {
  // Lots of options we have to consider.
  // 1) Easiest. Make sure local storage exists
  if (!localStorageAvailable()) { return BASE_VAL; }

  // 2) Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? moment(lastClosedStr) : null;
  if (lastClosed && moment() < lastClosed.add(TIME_LIMIT, TIME_INTERVAL)) {
    return BASE_VAL;
  }

  // 3) Check if we're on the right page.
  if (!ALLOWED_PAGES.has(actionName)) { return BASE_VAL; }

  // 4) Check the user agent
  if (!checkDeviceType(ALLOWED_DEVICES, userAgent)) { return BASE_VAL; }

  // 5) Don't show banner to people from certain countries
  if (DISALLOWED_COUNTRIES.has(country)) { return BASE_VAL; }

  // Create a bucket; a few rules are going to depend on that
  let userId = '';
  if (loid || data.user) { userId = loid || data.user.id; }
  const userIdSum = userId.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0);
  const bucket = userIdSum % 100;

  // 6) only show to a certain % of users that land on a given page
  for (let pageName in PAGE_PERCENTAGES) {
    if ((actionName === pageName) && (bucket > PAGE_PERCENTAGES[pageName])) {
      return BASE_VAL;
    }
  }

  // Ok, now we know we're actually going to show the banner. Next, we need to
  // determine what urls we're going to use
  // A) Use Tune links
  if (bucket < USE_TUNE) {
    // just use the universal Tune links
    return {
      ...BASE_VAL,
      show: true,
      clickUrl: constants.BANNER_URLS_TUNE.CLICK,
      impressionUrl: constants.BANNER_URLS_TUNE.IMPRESSION,
    };
  }

  // B) Use direct link. have to determine device type
  if (checkDeviceType(IOS_USER_AGENTS, userAgent)) {
    return {
      ...BASE_VAL,
      show: true,
      clickUrl: constants.BANNER_URLS_DIRECT.IOS,
    };
  }

  if (checkDeviceType(ANDROID_USER_AGENTS, userAgent)) {
    return {
      ...BASE_VAL,
      show: true,
      clickUrl: constants.BANNER_URLS_DIRECT.ANDROID,
    };
  }

  // C) don't have that device listed. infamous 'this should never happen' here.
  return BASE_VAL;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', moment());
}
