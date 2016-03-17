import React from 'react';
import cookies from 'cookies-js';

import constants from '../../constants';
import propTypes from '../../propTypes';
import querystring from 'querystring';
import BaseComponent from './BaseComponent';

import titleCase from '../../lib/titleCase';

import OverlayMenu from './OverlayMenu';
import { LinkRow, ButtonRow, ExpandoRow } from './OverlayMenuRow';

import menuItems from '../../userOverlayMenuItems';

const userIconClassName = 'icon-user-account icon-large blue';

class UserOverlayMenu extends BaseComponent {
  constructor(props) {
    super(props);

    this.state.compact = props.compact;

    this._viewPreferenceToggleClick = this._viewPreferenceToggleClick.bind(this);
    this._gotoDesktopSiteClick = this._gotoDesktopSiteClick.bind(this);
    this.renderOverlayBody = this.renderOverlayBody.bind(this);
  }

  loggedInUserRows(user) {
    const inboxCount = user.inbox_count;
    let badge;

    if (inboxCount) {
      badge = (
        <span className='badge badge-orangered badge-with-spacing'>
          { inboxCount }
        </span>
      );
    }

    return [
      <LinkRow
        key='account'
        text={ user.name }
        href={ `/u/${user.name}` }
        icon={ userIconClassName }
      >
        <a className='OverlayMenu-row-right-item' href='/logout' data-no-route={ true }>
          Log out
        </a>
      </LinkRow>,

      <LinkRow
        key='inbox'
        text={ ['Inbox', badge] }
        href='/message/inbox'
        icon={ `icon-message icon-large ${inboxCount ? 'orangered' : 'blue'}` }
      />,

      <LinkRow
        key='saved'
        text='Saved'
        href={ `/u/${user.name}/saved` }
        icon='icon-save icon-large lime'
      />,

      <LinkRow
        key='settings'
        text= 'Settings'
        href={ `${this.props.config.reddit}/prefs` }
        icon='icon-settings icon-large blue '
      />,
    ];
  }

  menuItemUrl(item, config) {
    const url = item.url;
    if (url.indexOf('/help') !== -1 || url.indexOf('/wiki') !== -1) {
      return item.url;
    }

    return `${config.reddit}${item.url}`;
  }

  renderOverlayBody() {
    const { user, config } = this.props;
    const compact = this.state.compact;

    let userBasedRows;

    if (user) {
      userBasedRows = this.loggedInUserRows(user);
    } else {
      userBasedRows = (
        <LinkRow
          key='login-row'
          text='Log in / sign up'
          icon={ userIconClassName }
          href={ config.loginPath }
        />);
    }

    return ([
      userBasedRows,
      <ButtonRow
        key='compact-toggle'
        icon='icon-compact icon-large blue'
        text={ `${compact ? 'Card' : 'Compact'} view` }
        clickHandler={ this._viewPreferenceToggleClick }
      />,
      <LinkRow
        key='goto-desktop'
        icon='icon-desktop icon-large blue'
        text='Desktop Site'
        href={ `https://www.reddit.com${this.props.ctx.url}` }
        clickHandler={ this._desktopSite }
      />,
      <ExpandoRow
        key='about-reddit'
        icon='icon-info icon-large'
        text='About Reddit'
      >
        { menuItems.aboutItems.map((item) => {
          return (
            <LinkRow
              href={ this.menuItemUrl(item, config) }
              key = { item.url }
              text={ titleCase(item.title) }
            />);
        }) }
      </ExpandoRow>,
      <ExpandoRow
        key='reddit-rules'
        icon='icon-rules icon-large'
        text='Reddit Rules'
      >
        { menuItems.ruleItems.map((item) => {
          return (
              <LinkRow
                href={ this.menuItemUrl(item, config) }
                key={ item.url }
                text={ titleCase(item.title) }
              />);
        }) }
      </ExpandoRow>,
    ]);
  }

  render() {
    const { app } = this.props;
    return (
      <OverlayMenu
        app={ app }
        openedOnEventName={ constants.TOP_NAV_HAMBURGER_CLICK }
        firesEventName={ constants.USER_MENU_TOGGLE }
        renderChildren={ this.renderOverlayBody }
      />);
  }

  _viewPreferenceToggleClick() {
    const {app, config } = this.props;
    const compact = this.state.compact;

    if (compact) {
      cookies.expire('compact');
    } else {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 2);

      cookies.set('compact', true, {
        expires: date,
        secure: config.https || config.httpsProxy,
      });
    }

    const newCompact = !compact;
    app.emit(constants.COMPACT_TOGGLE, newCompact);

    app.emit(constants.TOP_NAV_HAMBURGER_CLICK);
    this.setState({compact: newCompact});
  }

  _gotoDesktopSiteClick(e) {
    e.preventDefault();
    const url = this.props.ctx.url;
    let query = '';

    if (Object.keys(this.props.ctx.query).length > 0) {
      query = `?${querystring.stringify(this.props.ctx.query || {})}`;
    }

    this.props.app.emit('route:desktop', `${url}${query}`);
  }

  static propTypes = {
    compact: React.PropTypes.bool.isRequired,
    user: propTypes.user,
  };
}

export default UserOverlayMenu;
