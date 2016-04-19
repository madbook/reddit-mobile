import Flags from '@r/flags';

import constants from './constants';

const { BETA, SMARTBANNER } = constants.flags;

const config = {
  [BETA]: true,
  [SMARTBANNER]: true,
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

flags.addRule('userAgentSubstr', function(agents) {
  return !!agents
    .map(a => (this.props.ctx.userAgent || '').indexOf(a) > -1)
    .filter(b => b === true)
    .length;
});

export default flags;
