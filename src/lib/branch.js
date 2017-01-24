import cookies from 'js-cookie';
import pick from 'lodash/pick';
import url from 'url';


// Branch is the api we use to generate "deep links". These are links to
// our mobile app. With each link generated we also attach meta data.
// This meta data can then be used to analyze download patterns of our users.


// Get loid values either from the account state or the cookies.
function getLoidValues(accounts) {
  if (accounts.me) {
    return pick(accounts.me, ['loid', 'loidCreated']);
  }

  return {
    loid: cookies.get('loid'),
    loidCreated: cookies.get('loidCreated'),
  };
}

export function generateBranchLink(state, payload={}) {
  return url.format({
    protocol: 'https',
    host: 'reddit.app.link',
    pathname: '/',
    query: {
      ...generateBranchFields(state),
      ...payload,
    },
  });
}

function generateBranchFields(state) {
  const { user, accounts } = state;
  const { loid, loidCreated } = getLoidValues(accounts);

  let userName;
  let userId;

  const userAccount = user.loggedOut ? null : accounts[user.name];
  if (userAccount) {
    userName = userAccount.name;
    userId = userAccount.id;
  }

  return {
    channel: 'mweb_branch',
    feature: 'smartbanner',
    campaign: 'xpromo_banner',

    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    '$og_redirect': window.location.href,
    '$deeplink_path': window.location.href.split(window.location.host)[1],
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    utm_source: 'mweb_branch',
    utm_medium: 'smartbanner',
    utm_name: 'xpromo_banner',
    mweb_user_id36: userId,
    mweb_user_name: userName,
  };
}
