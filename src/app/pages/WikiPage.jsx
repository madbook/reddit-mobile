import React from 'react';
import { BackAnchor } from '@r/platform/components';

import CommunityHeader from 'app/components/CommunityHeader';
import Wiki from 'app/components/Wiki';

import isFakeSubreddit from 'lib/isFakeSubreddit';

const backToSubredditLink = subredditName => (
  <div className='WikiPage__invalid-subreddit'>
    Sorry, there's no wiki for
    <BackAnchor
      className='WikiPage__invalid-link'
      href={ `/r/${subredditName}` }
    >
      { `r/${subredditName}` }
    </BackAnchor>
  </div>
);

export const WikiPage = props => {
  const { subredditName, path } = props.urlParams;

  if (subredditName && isFakeSubreddit(subredditName)) {
    return backToSubredditLink(subredditName);
  }

  return (
    <div className='WikiPage BelowTopNav'>
      { subredditName ? <CommunityHeader subredditName={ subredditName } /> : null }
      <Wiki subredditName={ subredditName } path={ path } />
    </div>
  );
};
