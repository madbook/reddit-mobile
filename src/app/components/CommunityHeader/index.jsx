import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { themes } from 'app/constants';
import { formatNumber } from 'lib/formatNumber';

import Loading from 'app/components/Loading';
import SubredditSubscribeForm from 'app/components/SubredditSubscribeForm';

const { NIGHTMODE } = themes;
const UTF8Circle = '●';

const renderErrorMessage = error => {
  if (!error) {
    return false;
  }

  return (
    <div className='CommunityHeader-error row alert alert-danger alert-bar'>
      There was a problem, please try again
      <span
        className='CommunityHeader-clear-error-icon icon-clear white'
        onClick={ this._removeErrorRow }
      />
    </div>
  );
};

const renderBannerRow = (subreddit, theme) => {
  const iconUrl = subreddit.iconImage;

  const iconStyle = {};
  const iconClass = ['CommunityHeader-banner-icon-holder'];

  if (iconUrl) {
    iconStyle.backgroundImage = `url(${iconUrl})`;
    iconClass.push('CommunityHeader-banner-icon-holder-image');
  }

  const bannerStyle = {};
  const bannerClass = ['CommunityHeader-banner'];

  if (subreddit.keyColor) {
    if (theme === NIGHTMODE) {
      iconStyle.borderColor = subreddit.keyColor;

      if (iconStyle.backgroundImage) {
        iconStyle.backgroundColor = subreddit.keyColor;
      }
    } else {
      bannerStyle.backgroundColor = subreddit.keyColor;
    }
  }

  if (subreddit.bannerImage) {
    bannerClass.push('m-with-banner');
    bannerStyle.backgroundImage = `url(${subreddit.bannerImage})`;
  }

  return (
    <div className={ bannerClass.join(' ') } style={ bannerStyle }>
      <div className={ iconClass.join(' ') } style={ iconStyle } />
    </div>
  );
};

const renderSubscribeButton = subscriber => {
  const subscribeClass = subscriber ? 'subscriber' : 'subscribe';
  return (
    <button
      type='submit'
      className={ `CommunityHeader-${subscribeClass}-button` }
    >
      { ` ${subscriber ? 'Subscribed' : 'Subscribe'} ` }
    </button>
  );
};

const CommunityHeader = props => {
  const {
    subreddit,
    subredditRequest,
    subscribeError,
    theme,
  } = props;

  if (!subreddit) {
    if (subredditRequest && subredditRequest.failed) {
      return null;
    }

    return <Loading />;
  }

  let onlineCount;
  if (subreddit.accountsActive) {
    onlineCount = ` ${UTF8Circle} ${formatNumber(subreddit.accountsActive)} online`;
  }

  const errorMessageOrFalse = renderErrorMessage(subscribeError);
  const banner = renderBannerRow(subreddit, theme);

  return (
    <div className={ `CommunityHeader ${ subscribeError ? 'with-error' : '' }` }>
      { banner }
      <div className='CommunityHeader-text-row'>
        <h4 className='CommunityHeader-community-title'>
          { subreddit.displayNamePrefixed }
        </h4>
      </div>
      <div className='CommunityHeader-text-row'>
        <span>{ `${formatNumber(subreddit.subscribers)} subscribers` }</span>
        { onlineCount }
        <SubredditSubscribeForm
          subredditName={ subreddit.uuid }
          className='CommunityHeader-subscribe-form CommunityHeader-no-outline'
          renderBody={ renderSubscribeButton }
        />
      </div>
      { errorMessageOrFalse }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.subreddits[props.subredditName],
  (state, props) => state.subredditRequests[props.subredditName],
  () => (false), // return the subscrition error or etc here??,
  state => state.theme,
  (subreddit, subredditRequest, subscribeError, theme) => ({
    subreddit, subredditRequest, subscribeError, theme }),
);

export default connect(mapStateToProps)(CommunityHeader);
