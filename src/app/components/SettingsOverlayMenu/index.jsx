import React from 'react';
import { Form } from '@r/platform/components';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import titleCase from 'lib/titleCase';
import { urlWith } from 'lib/urlWith';

import OverlayMenu from 'app/components/OverlayMenu';
import { LinkRow, ButtonRow, ExpandoRow } from 'app/components/OverlayMenu/OverlayMenuRow';

import menuItems from './SettingsOverlayMenuItems';

import { themes } from 'app/constants';

const { NIGHTMODE } = themes;
const userIconClassName = 'icon-user-account icon-large blue';

export const menuItemUrl = (item, config={ reddit: 'https://www.reddit.com' }) => {
  const url = item.url;
  if (url.indexOf('/help') !== -1 || url.indexOf('/wiki') !== -1) {
    return { href: item.url };
  }

  return {
    href: `${config.reddit}${item.url}`,
    noRoute: true,
  };
};

export const renderLoginRow = () => (
  <LinkRow
    text='Log in / sign up'
    icon={ userIconClassName }
    href={ '/login' }
  />
);

export const renderLoggedInUserRows = (user) => {
  const { inboxCount } = user;
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
      <Form className='OverlayMenu-row-right-item' action='/logout'>
        <button type='submit'>
          Log out
        </button>
      </Form>
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
      noRoute={ true }
      href={ 'https://www.reddit.com/prefs' }
      icon='icon-settings icon-large blue'
    />,
  ];
};

export const SettingsOverlayMenu = (props) => {
  const { compact, theme, pageData, user } = props;
  const { url, queryParams } = pageData;

  return (
    <OverlayMenu>
      {
        user ? renderLoggedInUserRows(user) : renderLoginRow()
      }
      <ButtonRow
        key='compact-toggle'
        action='/actions/overlay-compact-toggle'
        icon='icon-compact icon-large blue'
        text={ `${compact ? 'Card' : 'Compact'} view` }
      />
      <ButtonRow
        key='theme-toggle'
        action='/actions/overlay-theme-toggle'
        icon={ 'icon-spaceship icon-large  blue' }
        text={ `${theme === NIGHTMODE ? 'Day' : 'Night'} Theme` }
      />
      <LinkRow
        key='goto-desktop'
        text='Desktop Site'
        icon='icon-desktop icon-large blue'
        noRoute={ true }
        href={ `https://www.reddit.com${urlWith(url, queryParams)}` }
      />
      <ExpandoRow
        key='about-reddit'
        icon='icon-info icon-large'
        text='About Reddit'
      >
        { menuItems.aboutItems.map((item) => {
          return (
            <LinkRow
              { ...menuItemUrl(item) }
              key = { item.url }
              text={ titleCase(item.title) }
            />);
        }) }
      </ExpandoRow>
      <ExpandoRow
        key='reddit-rules'
        icon='icon-rules icon-large'
        text='Reddit Rules'
      >
        { menuItems.ruleItems.map((item) => {
          return (
            <LinkRow
              { ...menuItemUrl(item) }
              key={ item.url }
              text={ titleCase(item.title) }
            />);
        }) }
      </ExpandoRow>
    </OverlayMenu>
  );
};

const compactSelector = (state) => state.compact;
const themeSelector = (state) => state.theme;
const pageDataSelector = (state) => state.platform.currentPage;
const userAccountSelector = (state) => {
  const { user } = state;
  if (user.loggedOut) { return; }
  const { name } = user;
  if (!name) { return; }

  return state.accounts[name];
};

const combineSelectors = (compact, theme, pageData, user) => ({
  compact, theme, pageData, user,
});

const mapStateToProps = createSelector(
  compactSelector,
  themeSelector,
  pageDataSelector,
  userAccountSelector,
  combineSelectors,
);

export default connect(mapStateToProps)(SettingsOverlayMenu);
