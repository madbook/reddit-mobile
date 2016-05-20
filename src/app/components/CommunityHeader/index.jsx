import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Form } from '@r/platform/components';

import { themes } from 'app/constants';
import formatNumber from 'lib/formatNumber';

import Loading from 'app/components/Loading';

const { NIGHTMODE } = themes;
const UTF8Circle = '●';

const renderErrorMessage = (error) => {
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


const CommunityHeader = (props) => {
  const {
    subreddit,
    subscribeError,
    theme,
  } = props;

  if (!subreddit) {
    return <Loading />;
  }

  const subscriber = subreddit.userIsSubscriber;

  let onlineCount;
  if (subreddit.accountsActive) {
    onlineCount = ` ${UTF8Circle} ${formatNumber(subreddit.accountsActive)} online`;
  }

  const followIcon = subscriber ? 'icon-check-circled lime' : 'icon-follow blue';
  const errorMessageOrFalse = renderErrorMessage(subscribeError);

  const banner = renderBannerRow(subreddit, theme);


  return (
    <div className={ `CommunityHeader ${ subscribeError ? 'with-error' : '' }` }>
      { banner }

      <div className='CommunityHeader-text-row'>
        <h4 className='CommunityHeader-community-title'>
          { subreddit.displayName }
        </h4>
      </div>

      <div className='CommunityHeader-text-row'>
        <span>{ `${formatNumber(subreddit.subscribers)} subscribers` }</span>
      { onlineCount }
        { ` ${UTF8Circle}` }
        <Form
          action='/actions/toggle-subreddit-subscription'
          className='CommunityHeader-subscribe-form CommunityHeader-no-outline'
        >
          <input type='hidden' name='subredditName' value={ subreddit.uuid } />
          <input type='hidden' name='fullName' value={ subreddit.name } />
          <input type='hidden' name='isSubscriber' value={ subreddit.userIsSubscriber } />
          <button type='submit' className='CommunityHeader-text-row-blue CommunityHeader-no-outline'>
            { ` ${subscriber ? 'Subscribed' : 'Subscribe'} ` }
            <span className='CommunityHeader-subscribe-button' >
              <span
                className={ `CommunityHeader-subscribe-icon icon ${followIcon}` }
              />
            </span>
          </button>
        </Form>
      </div>
      { errorMessageOrFalse }
    </div>
  );
};

const mapStateToProps = createSelector(
  (state, props) => state.subreddits[props.subredditName],
  () => (false), // return the subscrition error or etc here??,
  state => state.theme,
  (subreddit, subscribeError, theme) => ({ subreddit, subscribeError, theme }),
);

export default connect(mapStateToProps)(CommunityHeader);
