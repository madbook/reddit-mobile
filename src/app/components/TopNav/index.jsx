import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';
import { METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import cx from 'lib/classNames';

import * as overlayActions from 'app/actions/overlay';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';

import Logo from 'app/components/Logo';
import SnooIcon from 'app/components/SnooIcon';

export const TopNav = props => {
  const { assetPath, overlay } = props;

  // NOTE: this isn't working (no user in props)
  let notificationsCount;
  if (props.user && props.user.inbox_count) {
    notificationsCount = (
      <span className='badge badge-xs badge-orangered badge-right'>
        { props.user.inbox_count }
      </span>
    );
  }

  const settingsOpen = overlay === overlayActions.SETTINGS_MENU;
  const communityMenuOpen = overlay === overlayActions.COMMUNITY_MENU;
  const submitPostOpen = overlay === overlayActions.POST_SUBMIT;

  const sideNavIcon = cx('icon icon-menu icon-large', { blue: settingsOpen });
  const communityMenuIcon = cx('icon icon-nav-arrowdown', { blue: communityMenuOpen });
  const postSubmitMenuIcon = cx('icon icon-large', {
    'icon-post_edit': !submitPostOpen,
    'icon-nav-close': submitPostOpen,
  });

  const {
    toggleCommunityMenu,
    togglePostSubmit,
    toggleSearchBar,
    toggleSettingsMenu,
  } = props;

  return (
    <nav className={ `TopNav${settingsOpen ? ' opened' : ''}` }>
      <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
        <Anchor
          className='MobileButton TopNav-padding TopNav-snoo'
          href='/'
        >
          <SnooIcon />
        </Anchor>
        <h1 className='TopNav-text TopNav-padding'>
          <div
            className='TopNav-text-community-menu-button TopNav-text-vcentering'
            onClick={ toggleCommunityMenu }
          >
            <div className='TopNav-text-vcentering'>
              <Logo assetPath={ assetPath ? assetPath : '' } />
            </div>
            <div className='MobileButton community-button'>
              <span className={ communityMenuIcon } />
            </div>
          </div>
        </h1>
      </div>
      <div className='TopNav-padding TopNav-right' key='topnav-actions'>
        <div
          className='MobileButton TopNav-floaty'
          onClick={ togglePostSubmit }
        >
          <span className={ postSubmitMenuIcon } />
        </div>
        <div
          className='MobileButton TopNav-floaty'
          onClick={ toggleSearchBar }
        >
          <span className='icon icon-search icon-large' />
        </div>
        <div
          className='MobileButton TopNav-floaty'
          onClick={ toggleSettingsMenu }
        >
          <span className={ sideNavIcon }></span>
          { notificationsCount }
        </div>
      </div>
    </nav>
  );
};

const mapStateToProps = createSelector(
  state => state.overlay,
  state => state.session.isValid,
  (overlay, isLoggedIn) => {
    return { overlay, isLoggedIn };
  },
);

const mapDispatchProps = dispatch => ({
  toggleCommunityMenu: () => {
    // start fetching subscription list if we haven't already
    // it's safe to do this all the time because it's cached
    dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits());
    dispatch(overlayActions.toggleCommunityMenu());
  },

  togglePostSubmit: isLoggedIn => {
    if (isLoggedIn) {
      dispatch(overlayActions.togglePostSubmit());
    } else {
      dispatch(platformActions.navigateToUrl(METHODS.GET, '/register'));
    }
  },
  toggleSearchBar: () => { dispatch(overlayActions.toggleSearchBar()); },
  toggleSettingsMenu: () => { dispatch(overlayActions.toggleSettingsMenu()); },
});

const mergeProps = (stateProps, dispatchProps) => {
  const { isLoggedIn } = stateProps;
  const { togglePostSubmit } = dispatchProps;

  return {
    ...stateProps,
    ...dispatchProps,
    togglePostSubmit: () => { togglePostSubmit(isLoggedIn); },
  };
};

export default connect(mapStateToProps, mapDispatchProps, mergeProps)(TopNav);
