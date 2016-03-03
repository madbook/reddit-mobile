import React from 'react';

import constants from '../../constants';
import propTypes from '../../propTypes';

import BaseComponent from './BaseComponent';
import Logo from '../components/icons/Logo';
import SnooIcon from '../components/icons/SnooIcon';
import SearchBarController from '../components/search/SearchBarController';

const UserMenuButton = 'userMenuButton';
const CommunityMenuButton = 'communityMenuButton';

class TopNav extends BaseComponent {
  static propTypes = {
    user: propTypes.user,
    subredditName: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      communityMenuOpen: false,
      userMenuOpen: false,
    };


    this._onUserMenuToggle = this._onUserMenuToggle.bind(this);
    this._onCommunityMenuToggle = this._onCommunityMenuToggle.bind(this);
    this._topNavHamubrgerClick = this._onClick.bind(this, UserMenuButton);
    this._topNavCommunityButtonClick = this._onClick.bind(this, CommunityMenuButton);
    this._onWordMarkClick = this._onWordMarkClick.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.USER_MENU_TOGGLE, this._onUserMenuToggle);
    this.props.app.on(constants.COMMUNITY_MENU_TOGGLE, this._onCommunityMenuToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.USER_MENU_TOGGLE, this._onUserMenuToggle);
    this.props.app.off(constants.COMMUNITY_MENU_TOGGLE, this._onCommunityMenuToggle);
  }

  render() {
    const props = this.props;
    const feature = props.feature;

    const assetPath = props.app.config.assetPath;
    const { sideNavOpen, communityMenuOpen } = this.state;

    let currentSubredditPath = '';
    if (props.subredditName) {
      currentSubredditPath = `/r/${props.subredditName}`;
    }

    let notificationsCount;
    if (props.user && props.user.inbox_count) {
      notificationsCount = (
        <span className='badge badge-xs badge-orangered badge-right'>
          { props.user.inbox_count }
        </span>
      );
    }

    let sideNavIcon = 'icon-menu icon-large';
    if (sideNavOpen) {
      sideNavIcon += ' blue';
    }

    let communityMenuIcon = 'icon-nav-arrowdown';
    if (communityMenuOpen) {
      communityMenuIcon = 'icon-nav-arrowup blue';
    }

    let beta;
    if (feature.enabled('beta')) {
      beta = (<div className='TopNav-beta'>beta</div>);
    }

    return (
      <nav className={ `TopNav${this.state.sideNavOpen ? ' opened' : ''}` }>
        <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
          { beta }
          <a
            className='MobileButton TopNav-padding TopNav-snoo'
            href='/'
            data-no-route={ true }
          >
            <SnooIcon />
          </a>
          <h1 className='TopNav-text TopNav-padding'>
            <span className='TopNav-text-vcentering'>
              <a
                className='TopNav-a'
                href={ '/' }
                onClick={ this._onWordMarkClick }
                data-no-route={ true }
              >
                <Logo assetPath={ assetPath } />
              </a>
            </span>
            <button
              className='MobileButton community-button'
              onClick={ this._topNavCommunityButtonClick }
            >
              <span className={ communityMenuIcon } />
            </button>
          </h1>
        </div>
        <div className='TopNav-padding TopNav-right' key='topnav-actions'>
          <a
            className='MobileButton TopNav-floaty'
            href={ `${currentSubredditPath}/submit` }
          >
            <span className='icon-post_edit icon-large' />
          </a>
          <a
            className='MobileButton TopNav-floaty'
            href={ `${currentSubredditPath}/search` }
            data-no-route={ true }
          >
            <SearchBarController
              app={ this.props.app }
              ctx={ this.props.ctx }
            />
          </a>
          <button
            className='MobileButton TopNav-floaty'
            onClick={ this._topNavHamubrgerClick }
          >
            <span className={ sideNavIcon }></span>
            { notificationsCount }
          </button>
        </div>
      </nav>
   );
  }

  _onWordMarkClick(e) {
    e.preventDefault();
    this._topNavCommunityButtonClick();
  }

  _onClick(str) {
    switch (str) {
      case UserMenuButton:
        this.props.app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
        break;
      case CommunityMenuButton:
        this.props.app.emit(constants.TOP_NAV_COMMUNITY_CLICK);
        break;
    }
  }

  _onUserMenuToggle(bool) {
    this.setState({ sideNavOpen: bool });
  }

  _onCommunityMenuToggle(bool) {
    this.setState({ communityMenuOpen: bool});
  }
}

export default TopNav;
