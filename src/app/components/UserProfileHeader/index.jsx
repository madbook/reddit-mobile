import './styles.less';

import React from 'react';

import { Anchor } from 'platform/components';

import UserActivityHandler from 'app/router/handlers/UserActivity';
import { POSTS_ACTIVITY, COMMENTS_ACTIVITY } from 'app/actions/activities';

import SubredditSubscribeForm from 'app/components/SubredditSubscribeForm';

const T = React.PropTypes;

const renderFollowButton = follower => {
  const followClass = follower ? 'follower' : 'follow';
  return (
    <button type='submit' className={ `UserProfileHeader__${followClass}` }>
      { ` ${follower ? 'Following' : 'Follow'} ` }
    </button>
  );
};

export const UserProfileHeader = props => (
  <header className='UserProfileHeader'>
    <UserProfileBanner { ...props } />
    <UserProfileTabs { ...props } />
  </header>
);

UserProfileHeader.propTypes = {
  userName: T.string.isRequired,
  userSubreddit: T.string.isRequired,
  currentActivity: T.string,
  isMyUser: T.bool,
  isVerified: T.bool,
  loading: T.bool,
};

const UserProfileBanner = props => {
  const { isMyUser, isVerified, userName, userSubreddit } = props;
  return (
    <div className='UserProfileHeader__banner'>
      <h3 className='UserProfileHeader__banner-user-name'>u/{ userName }</h3>
      { isVerified && <div className='UserProfileHeader__verified icon icon-verified lime' /> }
      { userSubreddit && !isMyUser && <SubredditSubscribeForm
          subredditName={ userSubreddit.toLowerCase() }
          className='CommunityHeader-subscribe-form CommunityHeader-no-outline'
          renderBody={ renderFollowButton }
        />
      }
    </div>
  );
};

const UserProfileTabs = props => {
  const { userName, currentActivity } = props;
  return (
    <nav className='UserProfileHeader__tabs'>
      <UserProfileTab
        href={ UserActivityHandler.activityUrl(userName, null) }
        icon='icon-user-account'
        text='ABOUT'
        selected={ currentActivity === undefined }
      />
      <UserProfileTab
        href={ UserActivityHandler.activityUrl(userName, POSTS_ACTIVITY) }
        icon='icon-posts'
        text='POSTS'
        selected={ currentActivity === POSTS_ACTIVITY }
      />
      <UserProfileTab
        href={ UserActivityHandler.activityUrl(userName, COMMENTS_ACTIVITY) }
        icon='icon-comment'
        text='COMMENTS'
        selected={ currentActivity === COMMENTS_ACTIVITY }
      />
    </nav>
  );
};

const UserProfileTab = props => {
  const { href, icon, text, selected } = props;
  return (
    <Anchor href={ href } className={ 'UserProfileHeader__tab' } >
      <div className={ tabIconClassName(icon, selected) } />
      <div className={ tabTextClassName(selected) }>{ text }</div>
    </Anchor>
  );
};

const selectedClass = selected => selected ? 'selected' : '';

const tabIconClassName = (icon, selected) => (
  `UserProfileHeader__tab-icon icon ${icon} ${selectedClass(selected)}`
);

const tabTextClassName = selected => (
  `UserProfileHeader__tab-text ${selectedClass(selected)}`
);
