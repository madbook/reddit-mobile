import url from 'url';

import Flags from '@r/flags';

import constants from './constants';

const {
  NO_ADS,
  SMARTBANNER,
  VARIANT_RELEVANCY_TOP,
  VARIANT_RELEVANCY_ENGAGING,
  VARIANT_RELEVANCY_RELATED,
  VARIANT_NEXTCONTENT_BOTTOM,
  VARIANT_NEXTCONTENT_MIDDLE,
  VARIANT_NEXTCONTENT_BANNER,
  VARIANT_NEXTCONTENT_TOP3,
} = constants.flags;

const config = {
  [NO_ADS]: {
    url: 'experimentnoads',
    variant: 'no_ads:treatment',
  },
  [SMARTBANNER]: true,
  [VARIANT_RELEVANCY_TOP]: {
    or: [
      {
        and: {
          seoReferrer: true,
          loggedin: false,
        },
      }, {
        and: {
          subreddit: 'gaming',
          or: [{
            url: 'experimentrelevancytop',
            variant: 'relevancy_mweb:top',
          }],
        },
      },
    ],
  },
  [VARIANT_RELEVANCY_ENGAGING]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancyengaging',
        variant: 'relevancy_mweb:engaging',
      }],
    },
  },
  [VARIANT_RELEVANCY_RELATED]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancyrelated',
        variant: 'relevancy_mweb:related',
      }],
    },
  },
  [VARIANT_NEXTCONTENT_BOTTOM]: {
    url: 'experimentnextcontentbottom',
    and: {
      variant: 'nextcontent_mweb:bottom',
      loggedin: false,
    },
  },
  [VARIANT_NEXTCONTENT_MIDDLE]: {
    url: 'experimentnextcontentmiddle',
    and: {
      variant: 'nextcontent_mweb:middle',
      loggedin: false,
    },
  },
  [VARIANT_NEXTCONTENT_BANNER]: {
    url: 'experimentnextcontentbanner',
    and: {
      variant: 'nextcontent_mweb:banner',
      loggedin: false,
    },
  },
  [VARIANT_NEXTCONTENT_TOP3]: {
    url: 'experimentnextcontenttop3',
    and: {
      variant: 'nextcontent_mweb:top3',
      loggedin: false,
    },
  },
};

const flags = new Flags(config);

function extractUser(ctx) {
  const state = ctx.state;
  if (!state || !state.data || !state.data.user) {
    return {};
  }

  return state.data.user;
}

flags.addRule('loggedin', function(val) {
  return !!this.props.ctx.redditSession === val;
});

const SEO_REFERRERS = [
  'google.com',
  'bing.com',
];

flags.addRule('seoReferrer', function(wantSEO) {
  // Make sure we have a referrer and from the outside
  const referrer = this.props.ctx.referrer;
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

flags.addRule('url', function(query) {
  // turns { feature_thing: true, wat: 7 } into { thing: true }
  const parsedQuery = Flags.parseConfig(this.props.ctx.query);
  return Object.keys(parsedQuery).includes(query);
});

flags.addRule('and', (function (flags) {
  return function (config) {
    return Object.keys(config).every(rule => {
      if (!flags.rules[rule]) {
        return false;
      }
      return flags.rules[rule].call(this, config[rule]);
    });
  };
})(flags));

// OR is the default behavior, but we can't have multiple AND rules (or
// multiples of any rule type, or nested ORs with an AND) without an explicit
// OR
flags.addRule('or', (function (flags) {
  return function (config) {
    return config.some(subConfig =>
      Object.keys(subConfig).some(rule =>
        !flags.rules[rule] ? false : flags.rules[rule].call(this, subConfig[rule])
      )
    );
  };
})(flags));

flags.addRule('userAgentSubstr', function(agents) {
  return !!agents
    .map(a => (this.props.ctx.userAgent || '').indexOf(a) > -1)
    .filter(b => b === true)
    .length;
});

flags.addRule('subreddit', function (name) {
  return this.props.subredditName && this.props.subredditName.toLowerCase() === name.toLowerCase();
});

flags.addRule('variant', function (name) {
  const [experiment_name, checkedVariant] = name.split(':');
  const user = this.state.data.user || this.state.data.loggedOutUser;
  if (user && user.features && user.features[experiment_name]) {
    const { variant, experiment_id } = user.features[experiment_name];

    // Fire bucketing event.
    // A null variant means the user has been excluded from the experiment, so
    // there is no bucket
    let debouncedEvents;
    if (this.props.app.state) {
      debouncedEvents = this.props.app.state.debouncedEvents;
    }
    if (!debouncedEvents) {
      debouncedEvents = {};
      // There is no this.props.app.state on the server, so we will end up
      // sending this event multiple times, but that's OK. We use the
      // debouncing to avoid generating too much unneeded traffic.
      if (this.props.app.state) {
        this.props.app.state.debouncedEvents = debouncedEvents;
      }
    }
    const eventID = `bucket:${experiment_id}:${this.props.loid}`;
    if (variant && !debouncedEvents[eventID]) {
      debouncedEvents[eventID] = true;
      this.props.app.emit('bucket', {
        experiment_id,
        experiment_name,
        variant,
        loid: this.props.loid,
        loidcreated: this.props.loidcreated,
      });
    }
    return variant === checkedVariant;
  }
  return false;
});

export default flags;
