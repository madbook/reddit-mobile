import React from 'react';
import { models } from 'snoode';

import BaseComponent from './BaseComponent';
import constants from '../../constants';

const message = 'You must be at least eighteen years old to view this content.' +
                ' Are you over eighteen and willing to see adult content?';

const contentMap = {
  'over18': {
    message,
    class: 'icon-header-18plus',
    header: 'You must be 18+ to view this community',
  },
};

class Interstitial extends BaseComponent {
  static propTypes = {
    subredditName: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    customText: React.PropTypes.string,
  };
  
  constructor(props) {
    super(props);

    this.setOver18 = this.setOver18.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  async setOver18 () {
    var {app, apiOptions, topNavLink} = this.props;
    if (this.props.loggedIn) {
      var options = app.api.buildOptions(apiOptions);

      options = Object.assign(options, {
        model: new models.Preferences({over_18: true}),
        changeSet: ['over_18'],
      });

      try {
        await app.api.preferences.patch(options);
        app.emit(constants.TOGGLE_OVER_18, 'true');
        app.redirect(topNavLink);
      } catch (e) {
        app.error(e, this, app, { redirect: false, replaceBody: false });
      }
    } else {
      app.emit(constants.TOGGLE_OVER_18, 'true');
      app.redirect(topNavLink);
    }
  }

  goHome () {
    this.props.app.redirect('/');
  }

  render() {
    let props = this.props;
    let info = contentMap[props.type];

    let customText;
    let buttons;

    if (props.type === 'over18') {
      buttons = (
        <div>
          <button
            className='btn btn-primary btn-block'
            onClick={ this.goHome }
          >NO THANK YOU</button>
          <button
            className='btn btn-primary btn-block'
            onClick={ this.setOver18 }
          >CONTINUE</button>
        </div>
      );
    }

    if (props.customText) {
      customText = (
        <div className='panel interstitial-custom-text-panel'>
        <h3
          className='interstitial-custom-text-header'
        >{ '/r/' + props.subredditName || '/r/subreddit' }</h3>
        <p>{ props.customText || 'hello world this is a custom message for thi spanel' }</p>
        </div>
        );
    }


    return (
      <div className='interstitial-wrapper'>
        <div className='interstitial-icon-wrap'>
          <span className='icon-header-18plus'></span>
        </div>
        <h2 className='interstitial-header' >{ info.header }</h2>
        { customText }
        <p className='interstitial-text' >{ info.message }</p>
        { buttons }
      </div>
    );
  }
}

export default Interstitial;
