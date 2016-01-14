import React from 'react';

import constants from '../../constants';

import TopNav from '../components/TopNav';
import BasePage from '../pages/BasePage';
import InfoBar from '../components/InfoBar';
import UserOverlayMenu from '../components/UserOverlayMenu';
import CommunityOverlayMenu from '../components/CommunityOverlayMenu';

import { userData } from '../../routes';

class BodyLayout extends BasePage {
  constructor(props) {
    super(props);

    this._updateUserState = this._updateUserState.bind(this);
  }

  componentDidMount() {
    const { app } = this.props;
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

  render () {
    const { user, userSubscriptions } = this.state.data;
    const { app, globalMessage, showEUCookieMessage } = this.props;

    let messages = [];
    if (showEUCookieMessage) {
      messages.push({type: constants.messageTypes.EU_COOKIE});
    }

    if (globalMessage) {
      messages.push(globalMessage);
    }

    return (
      <div className='container-with-betabanner'>
        <CommunityOverlayMenu
          {...this.props}
          user={ user }
          subscriptions={ userSubscriptions }
        />
        <UserOverlayMenu {...this.props} user={ user } />
        <TopNav {...this.props} user={ user } />
        <InfoBar
          key='onlyRenderThisOnceEver'
          messages={ messages }
          app={ app }
          showEUCookieMessage={ showEUCookieMessage }
        />
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
