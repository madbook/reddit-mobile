import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { map } from 'lodash';

import titleCase from '../../../lib/titleCase';
import { urlWith } from '../../../lib/urlWith';

import NSFWFlair from '../NSFWFlair/NSFWFlair';
import OverlayMenu from '../OverlayMenu/OverlayMenu';
import { LinkRow, ButtonRow, ExpandoRow } from '../OverlayMenu/OverlayMenuRow';

const numCommunitiesText = (subscriptions) => {
  const num = subscriptions.length;
  if (num > 1) {
    return `${num} Communities`;
  } else if (num === 1) {
    return '1 Community';
  }
  return 'No Communities';
};

const renderSubscriptions = (subscriptions, theme) => (
  <ExpandoRow
    key='communities-row'
    icon='icon-settings'
    text='Subscribed'
    subtext={ numCommunitiesText(subscriptions) }
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
  const { user, subscriptions, theme } = props;

  return (
    <OverlayMenu>
      <LinkRow
        key='front-page-row'
        text={ `${user ? 'My ' :''}Front Page` }
        href='/'
        icon='icon-snoo-circled icon-xl orangered'
      />
      <LinkRow
        key='all-link'
        text='Popular'
        href='/r/all'
        icon='icon-bar-chart orangered-circled-xl'
      />
      { renderSubscriptions(subscriptions, theme) }
    </OverlayMenu>
  );
};

const subscribedSubredditsSelector = (state) => state.subscribedSubreddits.subreddits;
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

const combineSelectors = (subredditRecords, subredditStore, theme) => {
  const subscriptions = map(subredditRecords, r => subredditStore[r.uuid]);
  subscriptions.sort(compareDisplayName);

  return { subscriptions, theme };
};

const mapStateToProps = createSelector(
  subscribedSubredditsSelector,
  subredditStoreSelector,
  themeSelector,
  combineSelectors,
);

export default connect(mapStateToProps)(CommunityOverlayMenu);
