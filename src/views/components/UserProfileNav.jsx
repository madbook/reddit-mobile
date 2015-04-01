import React from 'react';
import moment from 'moment';

import CommentIconFactory from '../components/CommentIcon';
var CommentIcon;

import InfoIconFactory from '../components/InfoIcon';
var InfoIcon;

import GoldIconFactory from '../components/GoldIcon';
var GoldIcon;

import MailIconFactory from '../components/MailIcon';
var MailIcon;

import SettingsIconFactory from '../components/SettingsIcon';
var SettingsIcon;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

class UserProfileNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rollover: '',
    };
    this._onMouseLeave = this._onMouseLeave.bind(this);
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
      var left = 100/6;
    } else if (activityActive) {
      left = 300/6;
    } else {
      left = 500/6;
    }

    return (
      <div className='UserProfileNav shadow'>
        <div className='userProfileNav-width'>
          <ul className='UserProfileNav-ul list-unstyled'>
            <li role='presentation' className={'UserProfileNav-li' + profileActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}`} over={this._onMouseEnter.bind(this, 'about')} out={this._onMouseLeave}>
                <InfoIcon played={this.state.rollover === 'about'}/>
                <p className='UserProfileNav-p'>About</p>
              </MobileButton>
            </li>
            <li role='presentation' className={'UserProfileNav-li' +  activityActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}/activity`} over={this._onMouseEnter.bind(this, 'activity')} out={this._onMouseLeave}>
                <CommentIcon played={this.state.rollover === 'activity'}/>
                <p className='UserProfileNav-p'>Activity</p>
              </MobileButton>
            </li>
            <li role='presentation' className={'UserProfileNav-li' +  gildActive }>
              <MobileButton className='UserProfileNav-a' href={`/u/${name}/gild`} over={this._onMouseEnter.bind(this, 'gold')} out={this._onMouseLeave}>
                <GoldIcon played={this.state.rollover === 'gold'}/>
                <p className='UserProfileNav-p'>Give Gold</p>
              </MobileButton>
            </li>
          </ul>
          <div className='stalactite' style={ {left: left + "%"} }></div>
        </div>
      </div>
    );
  }

  _onMouseEnter(str) {
    this.setState({rollover: str});
  }

  _onMouseLeave() {
    this.setState({rollover: ''});
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
