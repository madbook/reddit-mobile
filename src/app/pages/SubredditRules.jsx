import React from 'react';

import { BackAnchor } from 'platform/components';

import CommunityHeader from 'app/components/CommunityHeader';
import SubredditRulesList from 'app/components/SubredditRulesList';

import isFakeSubreddit from 'lib/isFakeSubreddit';

const backToSubredditLink = subredditName => (
  <div className='SubredditRulesPage__invalid-subreddit'>
    Sorry, there's no about page for
    <BackAnchor
      className='SubredditRulesPage__invalid-link'
      href={ `/r/${subredditName}` }
    >
      { `r/${subredditName}` }
    </BackAnchor>
  </div>
);

export const SubredditRulesPage = props => {
  const { subredditName } = props.urlParams;

  if (isFakeSubreddit(subredditName)) {
    return backToSubredditLink(subredditName);
  }

  return (
    <div className='SubredditRulesPage'>
      <CommunityHeader subredditName={ subredditName } />
      <SubredditRulesList subredditName={ subredditName } />
    </div>
  );
};
