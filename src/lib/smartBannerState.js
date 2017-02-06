import url from 'url';
import cookies from 'js-cookie';

import localStorageAvailable from './localStorageAvailable';
import { getDevice, IOS_DEVICES, ANDROID } from 'lib/getDeviceFromState';
import * as constants from 'app/constants';
import features from 'app/featureFlags';

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

const { USE_BRANCH } = constants.flags;

// Get loid values either from the account state or the cookies.
function getLoidValues(accounts) {
  if (accounts.me) {
    return {
      loid: accounts.me.loid,
      loidCreated: accounts.me.loidCreated,
    };
  }

  const loid = cookies.get('loid');
  const loidCreated = cookies.get('loidcreated');

  return {
    loid,
    loidCreated,
  };
}

export function getBranchLink(state, payload={}) {
  const { user, accounts } = state;

  const { loid, loidCreated } = getLoidValues(accounts);

  let userName;
  let userId;

  const userAccount = user.loggedOut ? null : accounts[user.name];
  if (userAccount) {
    userName = userAccount.name;
    userId = userAccount.id;
  }

  const basePayload = {
    channel: 'mweb_branch',
    feature: 'xpromo',
    campaign: 'xpromo',
    // We can use this space to fill "tags" which will populate on the
    // branch dashboard and allow you sort/parse data. Optional/not required.
    // tags: [ 'tag1', 'tag2' ],
    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    '$og_redirect': window.location.href,
    '$deeplink_path': window.location.href.split(window.location.host)[1],
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    mweb_user_id36: userId,
    mweb_user_name: userName,
  };

  return url.format({
    protocol: 'https',
    host: 'reddit.app.link',
    pathname: '/',
    query: {...basePayload, ...payload},
  });
}

export function getDeepLink(state) {
  const device = getDevice(state);

  // See if we should use a Branch link
  const feature = features.withContext({ state });
  if (feature && feature.enabled(USE_BRANCH)) {
    // just use the universal Branch link
    return getBranchLink(state);
  }

  // Otherwise use a basic deep link

  if (IOS_DEVICES.includes(device)) {
    return constants.BANNER_URLS_DIRECT.IOS;
  }

  if (device === ANDROID) {
    return constants.BANNER_URLS_DIRECT.ANDROID;
  }
}

export function shouldNotShowBanner() {
  // Most of the decision for showing a cross-promo component will happen in
  // the featureFlags component, but we have a couple of things to consider
  // here.

  // Make sure local storage exists
  if (!localStorageAvailable()) {
    return 'local_storage_unavailable';
  }

  // Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? new Date(lastClosedStr).getTime() : 0;
  const lastClosedLimit = lastClosed + TWO_WEEKS;
  if (lastClosedLimit > Date.now()) {
    return 'dismissed_previously';
  }

  return false;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', new Date());
}
