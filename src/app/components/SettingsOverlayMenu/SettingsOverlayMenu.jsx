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
