import React from 'react';

import constants from '../../constants';

import TopNav from '../components/TopNav';
import BasePage from '../pages/BasePage';
import InfoBar from '../components/InfoBar';
import UserOverlayMenu from '../components/UserOverlayMenu';
import CommunityOverlayMenu from '../components/CommunityOverlayMenu';

import { userData } from '../../routes';

class BodyLayout extends BasePage {
  static propTypes = {
    hideTopNav: React.PropTypes.bool,
    showEUCookieMessage: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this._updateUserState = this._updateUserState.bind(this);
  }

  componentDidMount() {
    const app = this.props.app;
    app.on(constants.USER_DATA_CHANGED, this._updateUserState);
  }

  componentWillUnmount() {
    const { app } = this.props;
    app.off(constants.USER_DATA_CHANGED, this._updateUserState);
  }

  _updateUserState() {
    // rebuild the userData based promises so they can be reloaded
    if (this.props && this.props.app) {
      userData(this, this.props.app);
      this.watchProperties();
    }
  }

  renderTopNavIfVisible(props, state) {
    const { user, userSubscriptions } = state.data;
    const { app, globalMessage, showEUCookieMessage, hideTopNav } = props;

    if (hideTopNav) {
      return null;
    }

    const messages = [];
    if (showEUCookieMessage) {
      messages.push({type: constants.messageTypes.EU_COOKIE});
    }

    if (globalMessage) {
      messages.push(globalMessage);
    }

    return (
      <div>
        <CommunityOverlayMenu
          {...this.props}
          user={ user }
          subscriptions={ userSubscriptions }
          key='communitymenu'
        />
        <UserOverlayMenu {...this.props} user={ user } key='usermenu' />
        <TopNav {...this.props} feature={ this.state.feature } user={ user } key='topnav' />
        <InfoBar
          messages={ messages }
          app={ app }
          showEUCookieMessage={ showEUCookieMessage }
          key='onlyRenderThisOnceEver'
        />
      </div>
    );
  }

  render () {
    const topNavIfVisible = this.renderTopNavIfVisible(this.props, this.state);

    return (
      <div className='container-with-betabanner'>
        { topNavIfVisible }
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
