import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import querystring from 'querystring';

import titleCase from '../../../lib/titleCase';

import OverlayMenu from '../OverlayMenu/OverlayMenu';
import { LinkRow, ButtonRow, ExpandoRow } from '../OverlayMenu/OverlayMenuRow';

import menuItems from './SettingsOverlayMenuItems';

import { themes } from '../../constants';

const { NIGHTMODE, DAYMODE } = themes;
const userIconClassName = 'icon icon-user-account icon-large blue';

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

export const SettingsOverlayMenu = (props) => {
  const { compact, theme } = props;

  return (
    <OverlayMenu>
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

const combineSelectors = (compact, theme) => ({compact, theme});

const mapStateToProps = createSelector(
  compactSelector,
  themeSelector,
  combineSelectors,
);

export default connect(mapStateToProps)(SettingsOverlayMenu);
