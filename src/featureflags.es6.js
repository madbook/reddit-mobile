import Flags from '@r/flags';

import constants from './constants';

const {
  BETA,
  SMARTBANNER,
  VARIANT_RELEVANCY_TOP,
  VARIANT_RELEVANCY_ENGAGING,
  VARIANT_RELEVANCY_RELATED,
} = constants.flags;

const config = {
  [BETA]: true,
  [SMARTBANNER]: true,
  [VARIANT_RELEVANCY_TOP]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancytop',
        variant: 'relevancy_mweb:top',
      }],
    },
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
  return !!this.props.ctx.token === val;
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
  return this.props.subredditName && this.props.subredditName === name;
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
