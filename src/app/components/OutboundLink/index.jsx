import { createQuery, extractQuery } from '@r/platform/pageUtils';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import omit from 'lodash/omit';

import { convertId } from 'lib/eventUtils';

const T = React.PropTypes;

const addUserIdParam = (url, userId) => {
  if (!userId) {
    return url;
  }

  // the outbound click tracker relies on the `reddit_session` cookie
  // to get the userId. mobile web uses OAuth, not the `reddit_session` cookie.
  // This adds the `user_id` parameter so the click-tracker can properly
  // attribute the userId.
  const baseUrl = url.split('?')[0];
  const currentQuery = extractQuery(url);
  const newQuery = createQuery({
    ...currentQuery,
    user_id: userId,
  });


  // baseUrl still has the `?`
  return `${baseUrl}${newQuery}`;
};

const setOutboundURL = ($link, outboundLink, userId) => {
  // if our link hasn't expired, set the href to the outbound link
  if (outboundLink.expiration > Date.now()) {
    $link.href = addUserIdParam(outboundLink.url, userId);
  }
};

const resetOriginalURL = ($link, href) => {
  $link.href = href;
};

function OutboundLink(props) {
  const { outboundLink, userId, href } = props;
  // get all of the props we want to pass to standard react components (styles, className, etc)
  const linkProps = omit(props, 'outboundLink'); 
  
  if (!outboundLink) {
    // we don't have outbound link data, pass through to a normal anchor with no special handlers
    return <a { ...linkProps } />;
  }

  // Note: this component very intentionally doesn't use `setState` to change the 
  // the href rendered in the DOM like a traditional React component might.
  // `setState`'s changes are batched and not guaranteed to be invoked immediately.
  // We _need_ to change the href right when the user starts to click or tap
  // the link to guarantee the browser uses the correct outbound link 
  return (
    <a
      { ...linkProps }
      onMouseDown={ e => {
        // don't show the redirect url for right-click context menus
        if (e.which === 3) {
          return true;
        }

        setOutboundURL(e.target, outboundLink, userId);
      } }
      onMouseLeave={ e => resetOriginalURL(e.target, href) }
      onTouchStart={ e => setOutboundURL(e.target, outboundLink) }
    />
  );
}

OutboundLink.propTypes = {
  href: T.string.isRequired,
  outboundLink: T.shape({
    url: T.string.isRequired,
    expiration: T.number.isRequired,
  }),

  // expected props from connect
  userId: T.number,
};

const selector = createSelector(
  state => {
    const { user, accounts } = state;
    const userAccount = user.loggedOut ? null : accounts[user.name];
    return userAccount ? convertId(userAccount.id) : null;
  },
  (userId) => ({ userId }),
);

export default connect(selector)(OutboundLink);
