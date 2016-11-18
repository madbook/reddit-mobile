import Flags from '@r/flags';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';

import getSubreddit from 'lib/getSubredditFromState';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import url from 'url';
import { getEventTracker } from 'lib/eventTracker';
import { getDevice, IOS_DEVICES, ANDROID } from 'lib/getDeviceFromState';

import { flags as flagConstants } from './constants';

const {
  BETA,
  SMARTBANNER,
  USE_BRANCH,
  VARIANT_NEXTCONTENT_BOTTOM,
  VARIANT_RECOMMENDED_BOTTOM,
  VARIANT_RECOMMENDED_TOP,
  VARIANT_RECOMMENDED_TOP_PLAIN,
  VARIANT_SUBREDDIT_HEADER,
  VARIANT_XPROMO_BASE,
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_RATING,
} = flagConstants;

const config = {
  [BETA]: true,
  [SMARTBANNER]: {
    and: [
      { allowedPages: ['index', 'listing'] },
      { allowedDevices: IOS_DEVICES.concat(ANDROID) },
    ],
  },
  [USE_BRANCH]: true,
  [VARIANT_NEXTCONTENT_BOTTOM]: {
    url: 'experimentnextcontentbottom',
    and: [{
      variant: 'nextcontent_mweb:bottom',
    }, {
      loggedin: false,
    }],
  },
  [VARIANT_RECOMMENDED_BOTTOM]: {
    url: 'experimentrecommendedbottom',
    and: [{
      variant: 'recommended_srs:bottom',
    }, {
      loggedin: false,
    }, {
      seoReferrer: true,
    }],
  },
  [VARIANT_RECOMMENDED_TOP]: {
    url: 'experimentrecommendedtop',
    and: [{
      variant: 'recommended_srs:top',
    }, {
      loggedin: false,
    }, {
      seoReferrer: true,
    }],
  },
  [VARIANT_RECOMMENDED_TOP_PLAIN]: {
    url: 'experimentrecommendedtopplain',
    and: [{
      variant: 'recommended_srs:plain_list_top',
    }, {
      loggedin: false,
    }, {
      seoReferrer: true,
    }],
  },
  [VARIANT_SUBREDDIT_HEADER]: {
    url: 'experimentsubredditheader',
    and: [{
      variant: 'recommended_srs:sr_name_top',
    }, {
      loggedin: false,
    }, {
      seoReferrer: true,
    }],
  },
  [VARIANT_XPROMO_BASE]: {
    and: [
      { loggedin: false },
      { minLoidAge: 24 * 60 * 60 * 1000 }, // 1 day in ms
      { directVisit: true },
      { allowedPages: ['index'] },
      { or: [
        { and: [
          { allowedDevices: [ANDROID] },
          { variant: 'mweb_xpromo_interstitial_android:base',
            url: 'xpromobase',
          },
        ] },
        { and: [
          { allowedDevices: IOS_DEVICES },
          { variant: 'mweb_xpromo_interstitial_ios:base',
            url: 'xpromobase',
          },
        ] },
      ] },
    ],
  },
  [VARIANT_XPROMO_LIST]: {
    and: [
      { loggedin: false },
      { minLoidAge: 24 * 60 * 60 * 1000 }, // 1 day in ms
      { directVisit: true },
      { allowedPages: ['index'] },
      { or: [
        { and: [
          { allowedDevices: [ANDROID] },
          { variant: 'mweb_xpromo_interstitial_android:list',
            url: 'xpromolist',
          },
        ] },
        { and: [
          { allowedDevices: IOS_DEVICES },
          { variant: 'mweb_xpromo_interstitial_ios:list',
            url: 'xpromolist',
          },
        ] },
      ] },
    ],
  },
  [VARIANT_XPROMO_RATING]: {
    and: [
      { loggedin: false },
      { minLoidAge: 24 * 60 * 60 * 1000 }, // 1 day in ms
      { directVisit: true },
      { allowedPages: ['index'] },
      { or: [
        { and: [
          { allowedDevices: [ANDROID] },
          { variant: 'mweb_xpromo_interstitial_android:rating',
            url: 'xpromorating',
          },
        ] },
        { and: [
          { allowedDevices: IOS_DEVICES },
          { variant: 'mweb_xpromo_interstitial_ios:rating',
            url: 'xpromorating',
          },
        ] },
      ] },
    ],
  },
};

const flags = new Flags(config);
const SEO_REFERRERS = [
  'google.com',
  'bing.com',
];

function extractUser(ctx) {
  const { state } = ctx;
  if (!state || !state.user || !state.accounts) {
    return;
  }
  return state.accounts[state.user.name];
}

flags.addRule('loggedin', function(val) {
  return (!!this.state.user && !this.state.user.loggedOut) === val;
});

flags.addRule('users', function(users) {
  const user = extractUser(this);
  return users.includes(user.name);
});

flags.addRule('employee', function(val) {
  return extractUser(this).is_employee === val;
});

flags.addRule('admin', function(val) {
  return extractUser(this).is_admin === val;
});

flags.addRule('beta', function(val) {
  return extractUser(this).is_beta === val;
});

flags.addRule('url', function(query) {
  // turns { feature_thing: true, wat: 7 } into { thing: true }
  const parsedQuery = Flags.parseConfig(this.state.platform.currentPage.queryParams);
  return Object.keys(parsedQuery).includes(query);
});

flags.addRule('subreddit', function (name) {
  const subreddit = getSubreddit(this.state);
  if (!subreddit) {
    return false;
  }

  return subreddit.toLowerCase() === name.toLowerCase();
});

const firstBuckets = new Set();

flags.addRule('variant', function (name) {
  const [experiment_name, checkedVariant] = name.split(':');
  const user = extractUser(this);

  if (user && user.features && user.features[experiment_name]) {
    const { variant, experiment_id } = user.features[experiment_name];

    // we only want to bucket the user once per session for any given experiment.
    // to accomplish this, we're going to use the fact that featureFlags is a
    // singleton, and use `firstBuckets` (which is in this module's closure's
    // scope) to keep track of which experiments we've already bucketed.
    if (this.state.meta.env === 'CLIENT' && !firstBuckets.has(experiment_name)) {
      firstBuckets.add(experiment_name);

      const eventTracker = getEventTracker();
      const payload = {
        experiment_id,
        experiment_name,
        variant,
        user_id: !this.state.user.loggedOut ? parseInt(user.id, 36) : null,
        user_name: !this.state.user.loggedOut ? user.name : null,
        loid: this.state.user.loggedOut ? this.state.loid.loid : null,
        loidcreated: this.state.user.loggedOut ? this.state.loid.loidCreated : null,
      };

      eventTracker.track('bucketing_events', 'cs.bucket', omitBy(payload, isNull));
    }

    return variant === checkedVariant;
  }
  return false;
});

// need to keep this function format (not arrow format) to protect
// the value of 'this'
flags.addRule('seoReferrer', function (wantSEO) {
  // Make sure we have a referrer and from the outside
  const referrer = this.state.platform.currentPage.referrer;
  if (!referrer || !referrer.startsWith('http')) {
    return !wantSEO;
  }

  // Check if the referrer matches the list of hostnames
  const referrerHostname = url.parse(referrer).hostname;
  const isSEO = SEO_REFERRERS.some(seo => {
    return referrerHostname.indexOf(seo) !== -1;
  });

  // Compare if we want the user to be from SEO or not
  return (isSEO === wantSEO);
});

flags.addRule('directVisit', function (wantDirect) {
  const referrer = this.state.platform.currentPage.referrer;

  // TODO: We end up adding the initial page to the history twice, once due to
  // the platform SET_STATUS action and once due to the SET_PAGE action.
  const isDirect = !referrer && this.state.platform.history.length <= 2;

  return isDirect === wantDirect;
});

flags.addRule('allowedPages', function (allowedPages) {
  const routeMeta = getRouteMetaFromState(this.state);
  const actionName = routeMeta && routeMeta.name;
  return allowedPages.includes(actionName);
});

// This returns false when no loidCreated value is present, but it should
// really be used in conjunction with a loggedin: false rule, in which case we
// expect to have an loidCreated value.
flags.addRule('minLoidAge', function (minAge) {
  const loidCreated = this.state.accounts.me && this.state.accounts.me.loidCreated;

  if (!loidCreated) {
    return false;
  }

  const age = (new Date()) - (new Date(loidCreated));
  if (age < minAge) { return false; }

  return true;
});

flags.addRule('allowedDevices', function (allowed) {
  const device = getDevice(this.state);
  // If we don't know what device we're on, then we should not match any list
  // of allowed devices.
  return (!!device) && allowed.includes(device);
});

export default flags;
