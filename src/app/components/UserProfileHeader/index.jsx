import './styles.less';

import React from 'react';

import { Anchor } from '@r/platform/components';

import UserActivityHandler from 'app/router/handlers/UserActivity';
import { POSTS_ACTIVITY, COMMENTS_ACTIVITY } from 'app/actions/activities';

const T = React.PropTypes;

export const UserProfileHeader = props => (
  <header className='UserProfileHeader'>
    <UserProfileBanner { ...props } />
    <UserProfileTabs { ...props } />
  </header>
);

UserProfileHeader.propTypes = {
  userName: T.string.isRequired,
  currentActivity: T.string,
  isMyUser: T.bool,
};

const UserProfileBanner = props => {
  const { userName } = props;
  return (
    <div className='UserProfileHeader__banner'>
      <h3 className='UserProfileHeader__banner-user-name'>{ userName }</h3>
    </div>
  );
};

const UserProfileTabs = props => {
  const { userName, currentActivity } = props;
  return (
    <nav className='UserProfileHeader__tabs'>
      <UserProfileTab
        href={ `/u/${userName}` }
        icon='icon-user-account'
        text='ABOUT'
        selected={ currentActivity === undefined }
      />
      <UserProfileTab
        href={ UserActivityHandler.activityURL(userName, POSTS_ACTIVITY) }
        icon='icon-post'
        text='POSTS'
        selected={ currentActivity === POSTS_ACTIVITY }
      />
      <UserProfileTab
        href={ UserActivityHandler.activityURL(userName, COMMENTS_ACTIVITY) }
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
