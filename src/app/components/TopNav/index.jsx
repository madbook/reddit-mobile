import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor, BackAnchor } from '@r/platform/components';
import cx from 'lib/classNames';

import {
  OVERLAY_MENU_PARAMETER,
  urlWithPostSubmitMenuToggled,
  urlWithCommunityMenuToggled,
  urlWithSearchBarToggled,
  urlWithSettingsMenuToggled,
  COMMUNITY_MENU,
  SETTINGS_MENU,
  POST_SUBMIT,
} from 'app/actions/overlayMenu';

import Logo from 'app/components/Logo';
import SnooIcon from 'app/components/SnooIcon';

export const TopNav = (props) => {
  const { assetPath, overlayMenu, url, queryParams, isLoggedIn } = props;

  // NOTE: this isn't working (no user in props)
  let notificationsCount;
  if (props.user && props.user.inbox_count) {
    notificationsCount = (
      <span className='badge badge-xs badge-orangered badge-right'>
        { props.user.inbox_count }
      </span>
    );
  }

  const settingsOpen = overlayMenu === SETTINGS_MENU;
  const communityMenuOpen = overlayMenu === COMMUNITY_MENU;
  const submitPostOpen = overlayMenu === POST_SUBMIT;

  const sideNavIcon = cx('icon icon-menu icon-large', { blue: settingsOpen });
  const communityMenuIcon = cx('icon icon-nav-arrowdown', { blue: communityMenuOpen });
  const postSubmitMenuIcon = cx('icon icon-large', {
    'icon-post_edit': !submitPostOpen,
    'icon-nav-close': submitPostOpen,
  });

  const editIconUrl = isLoggedIn ?
    urlWithPostSubmitMenuToggled(url, queryParams) : '/login';

  return (
    <nav className={ `TopNav${settingsOpen ? ' opened' : ''}` }>
      <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
        <Anchor
          className='MobileButton TopNav-padding TopNav-snoo'
          href='/'
          data-no-route={ true }
        >
          <SnooIcon />
        </Anchor>
        <h1 className='TopNav-text TopNav-padding'>
          <BackAnchor
            className='TopNav-text-community-menu-button TopNav-text-vcentering'
            href={ urlWithCommunityMenuToggled(url, queryParams) }
          >
            <div className='TopNav-text-vcentering'>
              <Logo assetPath={ assetPath ? assetPath : '' } />
            </div>
            <div className='MobileButton community-button'>
              <span className={ communityMenuIcon } />
            </div>
          </BackAnchor>
        </h1>
      </div>
      <div className='TopNav-padding TopNav-right' key='topnav-actions'>
        <BackAnchor
          className='MobileButton TopNav-floaty'
          href={ editIconUrl }
        >
          <span className={ postSubmitMenuIcon } />
        </BackAnchor>
        <BackAnchor
          className='MobileButton TopNav-floaty'
          href={ urlWithSearchBarToggled(url, queryParams) }
        >
          <span className='icon icon-search icon-large' />
        </BackAnchor>
        <BackAnchor
          className='MobileButton TopNav-floaty'
          href={ urlWithSettingsMenuToggled(url, queryParams) }
        >
          <span className={ sideNavIcon }></span>
          { notificationsCount }
        </BackAnchor>
      </div>
    </nav>
  );
};

const mapStateToProps = createSelector(
  state => state.platform.currentPage,
  state => state.session.isValid,
  (pageParams, isLoggedIn) => {
    const { url, queryParams } = pageParams;
    const overlayMenu = queryParams[OVERLAY_MENU_PARAMETER];

    return { overlayMenu, url, queryParams, isLoggedIn };
  },
);

export default connect(mapStateToProps)(TopNav);
