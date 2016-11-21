import url from 'url';

import localStorageAvailable from './localStorageAvailable';
import { getDevice, IOS_DEVICES, ANDROID } from 'lib/getDeviceFromState';
import { trackPreferenceEvent } from 'lib/eventUtils';
import * as constants from 'app/constants';
import features from 'app/featureFlags';

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

const { USE_BRANCH } = constants.flags;

const EXTERNAL_PREF_NAME = 'hide_mweb_xpromo_banner';

export function getBranchLink(state, payload={}) {
  const { me={} } = state.accounts;
  const { loid, loidCreated } = me;

  const basePayload = {
    channel: 'mweb_branch',
    feature: 'smartbanner',
    campaign: 'xpromo_banner',
    // We can use this space to fill "tags" which will populate on the
    // branch dashboard and allow you sort/parse data. Optional/not required.
    // tags: [ 'tag1', 'tag2' ],
    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    '$og_redirect': window.location.href,
    '$deeplink_path': window.location.href.split(window.location.host)[1],
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    utm_source: 'mweb_branch',
    utm_medium: 'smartbanner',
    utm_name: 'xpromo_banner',
    // We currently only pass along data for logged-out users, but we will
    // populate these fields if we build and test cross-promotion experiences
    // for logged-in users.
    mweb_user_id36: null,
    mweb_user_name: null,
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

export function shouldShowBanner() {
  // Most of the decision for showing a cross-promo component will happen in
  // the featureFlags component, but we have a couple of things to consider
  // here.

  // Make sure local storage exists
  if (!localStorageAvailable()) { return false; }

  // Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? new Date(lastClosedStr).getTime() : 0;
  const lastClosedLimit = lastClosed + TWO_WEEKS;
  if (lastClosedLimit > Date.now()) {
    return false;
  }

  return true;
}

export function markBannerClosed(state) {
  if (!localStorageAvailable()) { return false; }

  // We use a separate externally-visible name/value for the preference for
  // clarity when analyzing these events in our data pipeline.
  trackPreferenceEvent(state, {
    modifiedPreferences: [EXTERNAL_PREF_NAME],
    preferences: {
      [EXTERNAL_PREF_NAME]: true,
    },
  });

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', new Date());
}
