import React from 'react';
import moment from 'moment';

import GoldIconFactory from '../components/GoldIcon';
var GoldIcon;

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render() {
    var props = this.props;
    var userProfile = props.userProfile;
    console.log(userProfile);
    var created = moment(userProfile.created * 1000);
      //TODO trophy case items can look like this when we get that data
      /*<li className='UserProfile-trophy clearfix'>
        <GoldIcon altered='true'/>
        <div className='pull-left'>
          <p className='UserProfile-trophy-title'>Gold Membership</p>
          <p className='UserProfile-trophy-date'>Since December 2014</p>
        </div>
      </li>
      <li className='UserProfile-trophy clearfix'>
        <GoldIcon altered='true'/>
        <div className='pull-left'>
          <p className='UserProfile-trophy-title'>Gold Membership</p>
          <p className='UserProfile-trophy-date'>Since December 2014</p>
        </div>
      </li>
      <li className='UserProfile-trophy clearfix'>
        <GoldIcon altered='true'/>
        <div className='pull-left'>
          <p className='UserProfile-trophy-title'>Gold Membership</p>
          <p className='UserProfile-trophy-date'>Since December 2014</p>
        </div>
      </li>
      <li className='UserProfile-trophy clearfix'>
        <GoldIcon altered='true'/>
        <div className='pull-left'>
          <p className='UserProfile-trophy-title'>Gold Membership</p>
          <p className='UserProfile-trophy-date'>Since December 2014</p>
        </div>
      </li>*/
    return (
      <article className={ 'UserProfile' }>
        <ul className='UserProfile-ul list-unstyled'>
          <li className='UserProfile-li h1'>
            <GoldIcon/>
            { userProfile.link_karma } Karma
          </li>
          <li className='UserProfile-li h1'>
            <GoldIcon/>
            Created { created.format('ll') }
          </li>
          <li className='UserProfile-li h1'>
            <GoldIcon/>
            Trophy Case
            <ul className='UserProfile-trophies list-unstyled'>
            </ul>
          </li>
        </ul>
      </article>
    );
  }
}

function UserProfileFactory(app) {
  GoldIcon = GoldIconFactory(app);
  return app.mutate('core/components/userProfile', UserProfile);
}

export default UserProfileFactory;
