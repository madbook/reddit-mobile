import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';

import {
  OVERLAY_MENU_PARAMETER,
  urlWithSettingsMenuToggled,
  urlWithCommunityMenuToggled,
} from 'app/actions/overlayMenu';

import Logo from 'app/components/Logo';
import SnooIcon from 'app/components/SnooIcon';
// import SearchBarController from 'app/components/components/search/SearchBarController';

export const TopNav = (props) => {
  console.log('topnav props', props);

  let { assetPath } = props;
  assetPath = assetPath ? assetPath : '';
  const { overlayMenu, subredditName, url, queryParams } = props;

  let currentSubredditPath = '';
  if (subredditName) {
    currentSubredditPath = `/r/${subredditName}`;
  }

  let notificationsCount;
  if (props.user && props.user.inbox_count) {
    notificationsCount = (
      <span className='badge badge-xs badge-orangered badge-right'>
        { props.user.inbox_count }
      </span>
    );
  }

  const sideNavOpen = overlayMenu === 'userMenu';
  const communityMenuOpen = overlayMenu === 'communityMenu';

  let sideNavIcon = 'icon icon-menu icon-large';
  if (sideNavOpen) {
    sideNavIcon += ' blue';
  }

  let communityMenuIcon = 'icon icon-nav-arrowdown';
  if (communityMenuOpen) {
    communityMenuIcon = 'icon icon-nav-arrowup blue';
  }

  return (
    <nav className={ `TopNav${sideNavOpen ? ' opened' : ''}` }>
      <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
        <Anchor
          className='MobileButton TopNav-padding TopNav-snoo'
          href='/'
          data-no-route={ true }
        >
          <SnooIcon />
        </Anchor>
        <h1 className='TopNav-text TopNav-padding'>
          <Anchor
            className='TopNav-text-community-menu-button TopNav-text-vcentering'
            href={ urlWithCommunityMenuToggled(url, queryParams) }
          >
            <div className='TopNav-text-vcentering'>
              <Logo assetPath={ assetPath } />
            </div>
            <div className='MobileButton community-button'>
              <span className={ communityMenuIcon } />
            </div>
          </Anchor>
        </h1>
      </div>
      <div className='TopNav-padding TopNav-right' key='topnav-actions'>
        <Anchor
          className='MobileButton TopNav-floaty'
          href={ `${currentSubredditPath}/submit` }
        >
          <span className='icon icon-post_edit icon-large' />
        </Anchor>
        <Anchor
          className='MobileButton TopNav-floaty'
          href={ `${currentSubredditPath}/search` }
          data-no-route={ true }
        >
          {/*<SearchBarController
            app={ this.props.app }
            ctx={ this.props.ctx }
            user={ this.props.user }
            loid={ this.props.loid }
            loidcreated={ this.props.loidcreated }
          />*/}
        </Anchor>
        <Anchor
          className='MobileButton TopNav-floaty'
          href={ urlWithSettingsMenuToggled(url, queryParams) }
        >
          <span className={ sideNavIcon }></span>
          { notificationsCount }
        </Anchor>
      </div>
    </nav>
  );
};

const pageParamsSelector = (state) => state.platform.currentPage;
const combineSelectors = (pageParams) => {
  const { url, urlParams, queryParams } = pageParams;
  const overlayMenu = queryParams[OVERLAY_MENU_PARAMETER];
  const { subredditName } = urlParams;

  return { overlayMenu, subredditName, url, queryParams };
};

const mapStateToProps = createSelector(
  pageParamsSelector,
  combineSelectors,
);

const mapDispatchToProps = (/*dispatch*/) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
