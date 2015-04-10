import React from 'react';
import moment from 'moment';

import CommentIconFactory from '../components/icons/CommentIcon';
var CommentIcon;

import InfoIconFactory from '../components/icons/InfoIcon';
var InfoIcon;

import GoldIconFactory from '../components/icons/GoldIcon';
var GoldIcon;

import MailIconFactory from '../components/icons/MailIcon';
var MailIcon;

import SettingsIconFactory from '../components/icons/SettingsIcon';
var SettingsIcon;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

class UserProfileNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdat(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render() {
    var props = this.props;
    var name = props.userName;

    var profileActive = props.profileActive ? ' active' : '';
    var activityActive = props.activityActive ? ' active' : '';
    var gildActive = props.gildActive ? ' active' : '';

    if (profileActive) {
      var left = 100 / 6;
    } else if (activityActive) {
      left = 300 / 6;
    } else {
      left = 500 / 6;
    }

    return (
      <div className='UserProfileNav shadow'>
        <div className='userProfileNav-width'>
          <ul className='UserProfileNav-ul list-unstyled'>
            <li role='presentation' className={'UserProfileNav-li' + profileActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}`}>
                <InfoIcon/>
                <p className='UserProfileNav-p'>About</p>
              </MobileButton>
            </li>
            <li role='presentation' className={'UserProfileNav-li' +  activityActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}/activity`}>
                <CommentIcon/>
                <p className='UserProfileNav-p'>Activity</p>
              </MobileButton>
            </li>
            <li role='presentation' className={'UserProfileNav-li' +  gildActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}/gild`}>
                <GoldIcon/>
                <p className='UserProfileNav-p'>Give Gold</p>
              </MobileButton>
            </li>
          </ul>
          <div className='stalactite' style={ {left: left + "%"} }></div>
        </div>
      </div>
    );
  }
}

function UserProfileNavFactory(app) {
  CommentIcon = CommentIconFactory(app);
  InfoIcon = InfoIconFactory(app);
  GoldIcon = GoldIconFactory(app);
  MailIcon = MailIconFactory(app);
  SettingsIcon = SettingsIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  return app.mutate('core/components/userProfileNav', UserProfileNav);
}

export default UserProfileNavFactory;
