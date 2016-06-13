import React from 'react';

import constants from '../../constants';
import propTypes from '../../propTypes';

import BaseComponent from './BaseComponent';
import OverlayMenu from './OverlayMenu';
import { LinkRow, ExpandoRow } from './OverlayMenuRow';
import CommunitySearchRow from './CommunitySearchRow';
import NSFWFlair from './NSFWFlair';

class CommunityOverlayMenu extends BaseComponent {
  constructor(props) {
    super(props);

    this.renderOverlayBody = this.renderOverlayBody.bind(this);
  }

  numCommunitiesText(subscriptions) {
    const num = subscriptions.length;
    if (num > 1) {
      return `${num} Communities`;
    } else if (num === 1) {
      return '1 Community';
    }
    return 'No Communities';
  }

  renderOverlayBody() {
    const { user, subscriptions, app } = this.props;
    const theme = app.getState('theme');

    let followingRow;
    if (subscriptions) {
      followingRow = (
        <ExpandoRow
          autoExapnded={ true }
          key='communities-row'
          icon='icon-settings'
          text='Subscribed'
          subtext={ this.numCommunitiesText(subscriptions) }
        >
          { subscriptions.map((subreddit) => {
            return (
              <LinkRow
                key={ `OverlayMenu-row-subscription-${subreddit.url}` }
                href={ subreddit.url }
                icon='OverlayMenu-icon-following-snoo'
                text={ (
                  <span>
                    <span className='CommunityRow__rSlash'>r/</span>
                    { subreddit.display_name }
                    { subreddit.over18 ? NSFWFlair : null }
                  </span>
                ) }
                iconURL={ subreddit.icon_img }
                iconBackgroundColor={ subreddit.key_color }
                theme={ theme }
              />
            ); }) }
        </ExpandoRow>
      );
    }

    return ([
      <CommunitySearchRow app={ app } key='search-row' />,
      <LinkRow
        key='front-page-row'
        text={ `${user ? 'My ' :''}Front Page` }
        href='/'
        icon='icon-snoo-circled icon-xl orangered'
      />,
      <LinkRow
        key='all-link'
        text='Popular'
        href='/r/all'
        icon='icon-bar-chart orangered-circled-xl'
      />,
      followingRow,
    ]);
  }

  render() {
    const { app } = this.props;

    return (
      <OverlayMenu
        app={ app }
        openedOnEventName={ constants.TOP_NAV_COMMUNITY_CLICK }
        firesEventName={ constants.COMMUNITY_MENU_TOGGLE }
        renderChildren={ this.renderOverlayBody }
      />);
  }


  static propTypes = {
    user: propTypes.user,
    subscriptions: propTypes.subscriptions,
  };
}

export default CommunityOverlayMenu;
