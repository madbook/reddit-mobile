import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import map from 'lodash/map';

import NSFWFlair from 'app/components/NSFWFlair';
import OverlayMenu from 'app/components/OverlayMenu';
import { LinkRow, ExpandoRow } from 'app/components/OverlayMenu/OverlayMenuRow';
import CommunitySearchRow from './CommunitySearchRow';

const numCommunitiesText = (subscriptions, loading) => {
  const num = subscriptions.length;
  if (num > 1) {
    return `${num} Communities`;
  } else if (num === 1) {
    return '1 Community';
  } else if (loading) {
    return 'Loading Subscriptions';
  }

  return 'No Communities';
};

const renderSubscriptions = (subscriptions, loading, theme) => (
  <ExpandoRow
    autoExpanded={ true }
    key='communities-row'
    icon='icon-settings'
    text='Subscribed'
    subtext={ numCommunitiesText(subscriptions, loading) }
  >
    { map(subscriptions, subreddit => (
        <LinkRow
          key={ `OverlayMenu-row-subscription-${subreddit.url}` }
          href={ subreddit.url }
          icon='OverlayMenu-icon-following-snoo'
          text={ (
            <span>
              <span className='CommunityRow__rSlash'>r/</span>
              { subreddit.displayName }
              { subreddit.over18 ? NSFWFlair : null }
            </span>
          ) }
          iconURL={ subreddit.iconImage }
          iconBackgroundColor={ subreddit.keyColor || '' }
          theme={ theme }
        />
      )) }
  </ExpandoRow>
);

export const CommunityOverlayMenu = (props) => {
  const { user, subscriptions, subscriptionsLoading, theme } = props;

  return (
    <OverlayMenu>
      <CommunitySearchRow />
      <LinkRow
        key='front-page-row'
        text={ `${user ? 'My ' :''}Front Page` }
        href='/'
        icon='icon-snoo-circled icon-xl orangered'
      />
      <LinkRow
        key='popular-link'
        text='Popular'
        href='/r/popular'
        icon='icon-rising mint-circled-xl'
      />
      <LinkRow
        key='all-link'
        text='All'
        href='/r/all'
        icon='icon-bar-chart orangered-circled-xl'
      />
      { renderSubscriptions(subscriptions, subscriptionsLoading, theme) }
    </OverlayMenu>
  );
};

const subscribedSubredditsSelector = (state) => state.subscribedSubreddits.subreddits;
const subscriptionsLoadingSelector = (state) => state.subscribedSubreddits.fetching;
const subredditStoreSelector = (state) => state.subreddits;
const themeSelector = (state) => state.theme;

const compareDisplayName = (a, b) => {
  const aName = a.displayName.toUpperCase();
  const bName = b.displayName.toUpperCase();

  if (aName < bName) {
    return -1;
  } else if (aName > bName) {
    return 1;
  }

  return 0;
};

const combineSelectors = (subscriptionRecords, subscriptionsLoading, subredditStore, theme) => {
  const subscriptions = map(subscriptionRecords, r => subredditStore[r.uuid]);
  subscriptions.sort(compareDisplayName);

  return { subscriptions, subscriptionsLoading, theme };
};

const mapStateToProps = createSelector(
  subscribedSubredditsSelector,
  subscriptionsLoadingSelector,
  subredditStoreSelector,
  themeSelector,
  combineSelectors,
);

export default connect(mapStateToProps)(CommunityOverlayMenu);
