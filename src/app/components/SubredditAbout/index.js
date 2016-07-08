import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from '@r/platform/components';

import Loading from 'app/components/Loading';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const subredditDescription = descriptionHTML => (
  <RedditLinkHijacker>
    <div
      className='SubredditAbout__description'
      dangerouslySetInnerHTML={ { __html: descriptionHTML } }
    />
  </RedditLinkHijacker>
);

const tryLoggingIn = () => (
  <div className='SubredditAbout__try-logging-in'>
    You may need to try <Anchor href='/login'>logging in</Anchor> to view this community
  </div>
);

const subredditLoadingError = (subredditName, user) => (
  <div className='SubredditAbout__loading-error'>
    Sorry, there was an error loading&nbsp;
    <Anchor href={ `/r/${subredditName}` }>
      { `r/${subredditName}` }
    </Anchor>
    { user.loggedOut && tryLoggingIn() }
  </div>
);

const SubredditAbout = (props) => {
  const { subreddit, subredditRequest, user, subredditName } = props;

  return (
    <div className='SubredditAbout'>
      { subreddit ? subredditDescription(subreddit.descriptionHTML)
        : subredditRequest && subredditRequest.failed ? subredditLoadingError(subredditName, user)
        : <Loading /> }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.subreddits[props.subredditName],
  (state, props) => state.subredditRequests[props.subredditName],
  state => state.user,
  (subreddit, subredditRequest, user) => ({ subreddit, subredditRequest, user }),
);

export default connect(mapStateToProps)(SubredditAbout);
