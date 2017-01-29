import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from 'platform/components';
import NSFWFlair from 'app/components/NSFWFlair';
import SubredditSubscribeForm from 'app/components/SubredditSubscribeForm';
import { themes } from 'app/constants';
import { formatNumber } from 'lib/formatNumber';

const renderIcon = (iconUrl, url, color, theme) => {
  let style;
  if (color) {
    if (theme === themes.NIGHTMODE && !iconUrl) {
      style = { borderColor: color };
    } else {
      style = { backgroundColor: color };
    }
  }

  return (
    <Anchor className='CommunityRow__icon' href={ url }>
      { iconUrl
        ? <img className='CommunityRow__iconImg' src={ iconUrl } style={ style }/>
        : <div className='CommunityRow__iconBlank' style={ style }/> }
    </Anchor>
  );
};

const renderDetails = (subreddit) => {
  const { displayName, subscribers, accountsActive, url, over18 } = subreddit;

  return (
    <Anchor className='CommunityRow__details' href={ url }>
      <div className='CommunityRow__name'>
        <span className='CommunityRow__rSlash'>r/</span>
        { displayName }
        { over18 ? NSFWFlair : null }
      </div>
      <div className='CommunityRow__counts'>
        { [subscribers, accountsActive]
          .filter(x => !!x)
          .map(formatNumber)
          .map((num, idx) => idx === 0 ? `${num} followers` : `${num} online`)
          .join(' • ') }
      </div>
    </Anchor>
  );
};

const renderAddButton = (subscriber) => {
  return subscriber
    ? <button className='CommunityRow__subscriptionButton icon icon-check-circled lime'/>
    : <button className='CommunityRow__subscriptionButton icon icon-follow blue'/>;
};

const renderAdd = (subredditName) => (
  <SubredditSubscribeForm
    subredditName={ subredditName }
    className='CommunityRow__add'
    renderBody={ renderAddButton }
  />
);

const CommunityRow = (props) => {
  const { subreddit, theme } = props;

  return (
    <div className='CommunityRow'>
      { renderIcon(subreddit.iconImage, subreddit.url, subreddit.keyColor, theme) }
      { renderDetails(subreddit) }
      { renderAdd(subreddit.uuid) }
    </div>
  );
};

const subredditSelector = (state, props) => state.subreddits[props.subredditName];
const themeSelector = state => state.theme;

const makeSelector = () => {
  return createSelector(
    subredditSelector,
    themeSelector,
    (subreddit, theme) => ({ subreddit, theme }),
  );
};

export default connect(makeSelector)(CommunityRow);
