import React from 'react';

import { BackAnchor } from '@r/platform/components';

import CommunityHeader from 'app/components/CommunityHeader';
import SubredditAbout from 'app/components/SubredditAbout';

import isFakeSubreddit from 'lib/isFakeSubreddit';

const backToSubredditLink = subredditName => (
  <div className='SubredditAboutPage__invalid-subreddit'>
    Sorry, there's no about page for
    <BackAnchor
      className='SubredditAboutPage__invalid-link'
      href={ `/r/${subredditName}` }
    >
      { `r/${subredditName}` }
    </BackAnchor>
  </div>
);

export const SubredditAboutPage = props => {
  const { subredditName } = props.urlParams;

  if (isFakeSubreddit(subredditName)) {
    return backToSubredditLink(subredditName);
  }

  return (
    <div className='SubredditAboutPage'>
      <CommunityHeader subredditName={ subredditName } />
      <SubredditAbout subredditName={ subredditName } />
    </div>
  );
};
