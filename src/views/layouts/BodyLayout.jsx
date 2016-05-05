import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';
import { TransitionMotion, spring } from 'react-motion';

import constants from '../../constants';
import TopNav from '../components/TopNav';
import BasePage from '../pages/BasePage';
import InfoBar from '../components/InfoBar';
import UserOverlayMenu from '../components/UserOverlayMenu';
import CommunityOverlayMenu from '../components/CommunityOverlayMenu';
import Toaster from '../components/toasters/Toaster';
import { userData } from '../../routes';

const TOASTER_HEIGHT = 80;

class BodyLayout extends BasePage {
  static propTypes = {
    hideTopNav: React.PropTypes.bool,
    showEUCookieMessage: React.PropTypes.bool,
  };

  get track() {
    return false;
  }

  constructor(props) {
    super(props);

    this.state.toasters = [];
    this._updateUserState = this._updateUserState.bind(this);
  }

  componentDidMount() {
    const app = this.props.app;
    app.on(constants.USER_DATA_CHANGED, this._updateUserState);
    app.on(constants.TOASTER, this.toggleToaster);
  }

  componentWillUnmount() {
    const { app } = this.props;
    app.off(constants.USER_DATA_CHANGED, this._updateUserState);
    app.off(constants.TOASTER, this.toggleToaster);
  }

  _updateUserState() {
    // rebuild the userData based promises so they can be reloaded
    if (this.props && this.props.app) {
      userData(this, this.props.app);
      this.watchProperties();
    }
  }

  toggleToaster = params => {
    this.setState({
      toasters: !isEmpty(params) ? [params] : [],
    });
  }

  closeToaster = () => {
    this.setState({
      toasters: [],
    });
  }

  toasterWillEnter = () => {
    return { marginBottom: -TOASTER_HEIGHT, height: TOASTER_HEIGHT };
  }

  toasterWillLeave = () => {
    return { marginBottom: spring(-TOASTER_HEIGHT) };
  }

  render() {
    const { hideTopNav } = this.props;

    return (
      <div className='BodyLayout container-with-betabanner'>
        { !hideTopNav ? this.renderTopNav() : null }
        <main>
          { this.props.children }
        </main>
        { this.renderToasterController() }
      </div>
    );
  }

  renderTopNav() {
    const { user, userSubscriptions } = this.state.data;
    const { app, globalMessage, showEUCookieMessage } = this.props;

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

  renderToasterController() {
    const { toasters } = this.state;

    return (
      <TransitionMotion
        willLeave={ this.toasterWillLeave }
        willEnter={ this.toasterWillEnter }
        defaultStyles={ toasters.map(t => ({
          key: `toaster_${t.type}`,
          data: t,
          style: { marginBottom: -TOASTER_HEIGHT, height: TOASTER_HEIGHT },
        })) }
        styles={ toasters.map(t => ({
          key: `toaster_${t.type}`,
          data: t,
          style: { marginBottom: spring(0), height: TOASTER_HEIGHT },
        })) }
      >
        { styles => (
          <div>
            { styles.map(config => (
              <div
                className='BodyLayout__toasterContainer'
                key={ config.key }
                style={ config.style }
              >
                { this.renderToaster(config.data) }
              </div>
            )) }
          </div>
        ) }
      </TransitionMotion>
    );
  }

  renderToaster({ type, message }) {
    return (
      <Toaster
        message={ message }
        iconType={ type }
        onClose={ this.closeToaster }
      />
    );
  }
}

export default BodyLayout;
